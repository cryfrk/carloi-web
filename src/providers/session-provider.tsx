'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { requestAuth, requestAuthGet, requestProxy, requestSession } from '@/lib/client-api';
import { normalizeAppSnapshot } from '@/lib/normalize-snapshot';
import type { AppSnapshot, BackendResponse, MessageAttachment } from '@/lib/types';

interface SessionContextValue {
  snapshot: AppSnapshot | null;
  setSnapshot: (snapshot: AppSnapshot | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<BackendResponse>;
  register: (payload: {
    name: string;
    handle: string;
    bio: string;
    email: string;
    phone?: string;
    password: string;
    primaryChannel?: 'email' | 'phone';
    signupVerification?: {
      code: string;
    };
    accountType?: 'individual' | 'commercial';
    consents?: Array<{
      type: 'terms_of_service' | 'privacy_policy' | 'content_responsibility' | 'marketing_optional';
      accepted?: boolean;
      version?: string;
      sourceScreen?: string;
    }>;
    commercialProfile?: {
      companyName?: string;
      taxOrIdentityType?: 'VKN' | 'TCKN';
      taxOrIdentityNumber?: string;
    };
  }) => Promise<BackendResponse>;
  startVerification: (payload: {
    channel: 'email' | 'phone';
    destination: string;
  }) => Promise<BackendResponse>;
  verifyEmailToken: (token: string) => Promise<BackendResponse>;
  verifyEmail: (email: string, code: string) => Promise<BackendResponse>;
  resendVerificationCode: (email: string) => Promise<BackendResponse>;
  forgotPassword: (email: string) => Promise<BackendResponse>;
  resetPasswordWithToken: (token: string, password: string) => Promise<BackendResponse>;
  resetPassword: (email: string, code: string, password: string) => Promise<BackendResponse>;
  runSnapshotAction: (path: string, init?: RequestInit) => Promise<BackendResponse>;
  uploadMedia: (file: File, kind: 'image' | 'video' | 'gif' | 'audio') => Promise<string>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
  initialSnapshot,
}: {
  children: ReactNode;
  initialSnapshot: AppSnapshot | null;
}) {
  const [snapshot, setSnapshot] = useState<AppSnapshot | null>(normalizeAppSnapshot(initialSnapshot));

  const refresh = useCallback(async () => {
    const nextSnapshot = await requestSession();
    setSnapshot(normalizeAppSnapshot(nextSnapshot));
  }, []);

  const syncSnapshot = useCallback((response: BackendResponse) => {
    if (response.snapshot) {
      setSnapshot(normalizeAppSnapshot(response.snapshot));
    }
    return response;
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) =>
      syncSnapshot(
        await requestAuth<BackendResponse>('/api/auth/login', {
          identifier,
          password,
        }),
      ),
    [syncSnapshot],
  );

  const register = useCallback(
    async (payload: {
      name: string;
      handle: string;
      bio: string;
      email: string;
      phone?: string;
      password: string;
      primaryChannel?: 'email' | 'phone';
      signupVerification?: {
        code: string;
      };
      accountType?: 'individual' | 'commercial';
      consents?: Array<{
        type: 'terms_of_service' | 'privacy_policy' | 'content_responsibility' | 'marketing_optional';
        accepted?: boolean;
        version?: string;
        sourceScreen?: string;
      }>;
      commercialProfile?: {
        companyName?: string;
        taxOrIdentityType?: 'VKN' | 'TCKN';
        taxOrIdentityNumber?: string;
      };
    }) => syncSnapshot(await requestAuth<BackendResponse>('/api/auth/register', payload)),
    [syncSnapshot],
  );

  const startVerification = useCallback(
    async (payload: { channel: 'email' | 'phone'; destination: string }) =>
      requestAuth<BackendResponse>('/api/auth/verification/start', payload),
    [],
  );

  const verifyEmail = useCallback(
    async (email: string, code: string) =>
      syncSnapshot(await requestAuth<BackendResponse>('/api/auth/verify-email', { email, code })),
    [syncSnapshot],
  );

  const verifyEmailToken = useCallback(
    async (token: string) =>
      syncSnapshot(
        await requestAuthGet<BackendResponse>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`),
      ),
    [syncSnapshot],
  );

  const resendVerificationCode = useCallback(
    async (email: string) =>
      requestAuth<BackendResponse>('/api/auth/resend-verification-code', { email }),
    [],
  );

  const forgotPassword = useCallback(
    async (email: string) => requestAuth<BackendResponse>('/api/auth/forgot-password', { email }),
    [],
  );

  const resetPassword = useCallback(
    async (email: string, code: string, password: string) =>
      syncSnapshot(await requestAuth<BackendResponse>('/api/auth/reset-password', { email, code, password })),
    [syncSnapshot],
  );

  const resetPasswordWithToken = useCallback(
    async (token: string, password: string) =>
      syncSnapshot(
        await requestAuth<BackendResponse>('/api/auth/reset-password', {
          token,
          newPassword: password,
        }),
      ),
    [syncSnapshot],
  );

  const logout = useCallback(async () => {
    await requestAuth<BackendResponse>('/api/auth/logout', undefined);
    setSnapshot(null);
  }, []);

  const runSnapshotAction = useCallback(
    async (path: string, init: RequestInit = {}) => syncSnapshot(await requestProxy<BackendResponse>(path, init)),
    [syncSnapshot],
  );

  const uploadMedia = useCallback(async (file: File, kind: 'image' | 'video' | 'gif' | 'audio') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);

    const response = await fetch('/api/proxy/api/media/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const data = (await response.json()) as BackendResponse;
    if (!response.ok || !data.success || !data.url) {
      throw new Error(data.message || 'Dosya yüklenemedi.');
    }

    return data.url;
  }, []);

  const value = useMemo(
    () => ({
      snapshot,
      setSnapshot,
      refresh,
      logout,
      login,
      register,
      startVerification,
      verifyEmailToken,
      verifyEmail,
      resendVerificationCode,
      forgotPassword,
      resetPasswordWithToken,
      resetPassword,
      runSnapshotAction,
      uploadMedia,
    }),
    [
      snapshot,
      refresh,
      logout,
      login,
      register,
      startVerification,
      verifyEmailToken,
      verifyEmail,
      resendVerificationCode,
      forgotPassword,
      resetPasswordWithToken,
      resetPassword,
      runSnapshotAction,
      uploadMedia,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('SessionProvider bulunamadı.');
  }

  return context;
}

export function buildMessageAttachments(
  files: { kind: 'image' | 'video' | 'audio'; url: string; name: string; mimeType?: string }[],
): MessageAttachment[] {
  return files.map((file) => ({
    id: `${file.kind}-${file.url}`,
    kind: file.kind,
    label: file.name,
    uri: file.url,
    mimeType: file.mimeType,
  }));
}

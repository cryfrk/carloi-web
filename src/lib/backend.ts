import { cookies } from 'next/headers';

import { webEnv } from '@/lib/env';
import {
  normalizeAppSnapshot,
  normalizePost,
  normalizePublicProfilePayload,
} from '@/lib/normalize-snapshot';
import type { AppSnapshot, BackendResponse, PublicProfilePayload, Post } from '@/lib/types';

export const SESSION_COOKIE = webEnv.sessionCookieName;
const BACKEND_FETCH_TIMEOUT_MS = 30000;

function getBackendTimeoutMessage(path: string) {
  if (path.includes('/api/auth/register')) {
    return 'Kayit istegi su anda tamamlanamadi. Carloi sunucusu beklenenden uzun surede yanit veriyor. Lutfen kisa bir sure sonra tekrar deneyin.';
  }

  return 'Sunucu su anda zamaninda yanit veremedi. Lutfen tekrar deneyin.';
}

function getBackendNetworkMessage(path: string) {
  if (path.includes('/api/auth/register')) {
    return 'Uyelik olusturma servisine su anda ulasilamiyor. Lutfen baglantinizi kontrol edip tekrar deneyin.';
  }

  return 'Carloi API sunucusuna su anda ulasilamiyor. Lutfen biraz sonra tekrar deneyin.';
}

export class BackendError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function backendFetch<T = BackendResponse>(
  path: string,
  init: RequestInit & {
    token?: string;
    nextConfig?: {
      revalidate?: number | false;
      tags?: string[];
    };
  } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  if (init.token) {
    headers.set('Authorization', `Bearer ${init.token}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BACKEND_FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${webEnv.apiBaseUrl}${path}`, {
      ...init,
      headers,
      cache: init.cache ?? 'no-store',
      next: init.nextConfig,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new BackendError(getBackendTimeoutMessage(path), 504);
    }

    throw new BackendError(getBackendNetworkMessage(path), 502);
  } finally {
    clearTimeout(timeout);
  }

  const data = (await response.json().catch(() => ({}))) as T & { success?: boolean; message?: string };
  if (!response.ok || (typeof data === 'object' && data && 'success' in data && data.success === false)) {
    throw new BackendError((data as { message?: string }).message || 'API istegi basarisiz oldu.', response.status || 500);
  }

  return data;
}

export async function getServerToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value || '';
}

export async function getServerSnapshot() {
  const token = await getServerToken();
  if (!token) {
    return null;
  }

  try {
    const response = await backendFetch<BackendResponse<AppSnapshot>>('/api/bootstrap', {
      token,
    });
    return normalizeAppSnapshot(response.snapshot);
  } catch {
    return null;
  }
}

export async function getPublicPost(postId: string) {
  const response = await backendFetch<BackendResponse<Post>>(`/api/public/posts/${postId}`);
  return response.post ? normalizePost(response.post) : null;
}

export async function getPublicListing(postId: string) {
  const response = await backendFetch<BackendResponse<Post>>(`/api/public/listings/${postId}`);
  return response.post ? normalizePost(response.post) : null;
}

export async function getPublicProfile(handle: string) {
  const response = await backendFetch<BackendResponse<PublicProfilePayload>>(
    `/api/public/profiles/${encodeURIComponent(handle.replace(/^@/, ''))}`,
  );

  return normalizePublicProfilePayload({
    profile: response.profile,
    posts: response.posts,
    listings: response.listings,
    followers: response.followers,
    following: response.following,
  }) as PublicProfilePayload;
}

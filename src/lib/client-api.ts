'use client';

import type { AppSnapshot, BackendResponse } from '@/lib/types';

const CLIENT_REQUEST_TIMEOUT_MS = 30000;

function getAuthTimeoutMessage(path: string) {
  if (path.includes('/api/auth/register')) {
    return 'Kayit istegi su anda tamamlanamadi. Carloi sunucusu beklenenden uzun surede yanit veriyor. Lutfen kisa bir sure sonra tekrar deneyin.';
  }

  if (path.includes('/api/auth/login')) {
    return 'Giris istegi su anda tamamlanamadi. Carloi sunucusu beklenenden uzun surede yanit veriyor. Lutfen tekrar deneyin.';
  }

  return 'Sunucu su anda zamaninda yanit veremedi. Lutfen tekrar deneyin.';
}

function getAuthNetworkMessage(path: string) {
  if (path.includes('/api/auth/register')) {
    return 'Uyelik olusturma servisine su anda ulasilamiyor. Lutfen baglantinizi kontrol edip tekrar deneyin.';
  }

  if (path.includes('/api/auth/login')) {
    return 'Giris servisine su anda ulasilamiyor. Lutfen baglantinizi kontrol edip tekrar deneyin.';
  }

  return 'Carloi sunucusuna su anda ulasilamiyor. Lutfen baglantinizi kontrol edip tekrar deneyin.';
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & {
    success?: boolean;
    message?: string;
  };

  if (!response.ok || (typeof data === 'object' && data && 'success' in data && data.success === false)) {
    throw new Error((data as { message?: string }).message || 'Istek basarisiz oldu.');
  }

  return data;
}

export async function requestAuth<T = BackendResponse>(
  path: string,
  body?: unknown,
  method = 'POST',
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLIENT_REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(getAuthTimeoutMessage(path));
    }

    throw new Error(getAuthNetworkMessage(path));
  } finally {
    clearTimeout(timeout);
  }

  return parseResponse<T>(response);
}

export async function requestAuthGet<T = BackendResponse>(path: string): Promise<T> {
  return requestAuth<T>(path, undefined, 'GET');
}

export async function requestProxy<T = BackendResponse>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api/proxy${path}`, {
    ...init,
    credentials: 'include',
  });
  return parseResponse<T>(response);
}

export async function requestAdminProxy<T = BackendResponse>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api/admin-proxy${path}`, {
    ...init,
    credentials: 'include',
  });
  return parseResponse<T>(response);
}

export async function requestSession() {
  const response = await fetch('/api/auth/session', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  if (response.status === 401) {
    return null;
  }

  const data = await parseResponse<BackendResponse<AppSnapshot>>(response);
  return data.snapshot || null;
}

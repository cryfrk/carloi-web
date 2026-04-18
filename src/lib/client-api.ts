'use client';

import type { AppSnapshot, BackendResponse } from '@/lib/types';

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & {
    success?: boolean;
    message?: string;
  };

  if (!response.ok || (typeof data === 'object' && data && 'success' in data && data.success === false)) {
    throw new Error((data as { message?: string }).message || 'İstek başarısız oldu.');
  }

  return data;
}

export async function requestAuth<T = BackendResponse>(
  path: string,
  body?: unknown,
  method = 'POST',
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseResponse<T>(response);
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

import { cookies } from 'next/headers';

import { webEnv } from '@/lib/env';
import type { AppSnapshot, BackendResponse, PublicProfilePayload, Post } from '@/lib/types';

export const SESSION_COOKIE = webEnv.sessionCookieName;

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

  const response = await fetch(`${webEnv.apiBaseUrl}${path}`, {
    ...init,
    headers,
    cache: init.cache ?? 'no-store',
    next: init.nextConfig,
  });

  const data = (await response.json().catch(() => ({}))) as T & { success?: boolean; message?: string };
  if (!response.ok || (typeof data === 'object' && data && 'success' in data && data.success === false)) {
    throw new BackendError(
      (data as { message?: string }).message || 'API isteği başarısız oldu.',
      response.status || 500,
    );
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
    return response.snapshot || null;
  } catch {
    return null;
  }
}

export async function getPublicPost(postId: string) {
  const response = await backendFetch<BackendResponse<Post>>(`/api/public/posts/${postId}`);
  return response.post || null;
}

export async function getPublicListing(postId: string) {
  const response = await backendFetch<BackendResponse<Post>>(`/api/public/listings/${postId}`);
  return response.post || null;
}

export async function getPublicProfile(handle: string) {
  const response = await backendFetch<BackendResponse<PublicProfilePayload>>(
    `/api/public/profiles/${encodeURIComponent(handle.replace(/^@/, ''))}`,
  );

  return {
    profile: response.profile!,
    posts: response.posts || [],
    listings: response.listings || [],
    followers: response.followers || [],
    following: response.following || [],
  };
}

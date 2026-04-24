import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { backendFetch, SESSION_COOKIE } from '@/lib/backend';
import { toErrorResponse } from '@/lib/route-error';

async function withSessionCookie<T extends { token?: string }>(data: T) {
  const response = NextResponse.json(data);
  if (data.token) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token') || '';
    const data = await backendFetch(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });

    return withSessionCookie(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await backendFetch('/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return withSessionCookie(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}

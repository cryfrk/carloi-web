import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { SESSION_COOKIE } from '@/lib/backend';
import { webEnv } from '@/lib/env';

const API_BASE_URL = webEnv.apiBaseUrl.replace(/\/+$/g, '');

async function forward(request: Request, params: { path: string[] }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value || '';

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: 'Admin oturumu bulunamadi.',
      },
      { status: 401 },
    );
  }

  const backendPath = params.path.join('/');
  const query = new URL(request.url).search || '';
  const targetUrl = `${API_BASE_URL}/api/admin/${backendPath}${query}`;
  const headers = new Headers();
  const contentType = request.headers.get('content-type');

  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  const hasBody = !['GET', 'HEAD'].includes(request.method);
  const body = hasBody ? Buffer.from(await request.arrayBuffer()) : undefined;

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        ...Object.fromEntries(headers.entries()),
        Authorization: `Bearer ${token}`,
      },
      body,
      cache: 'no-store',
    });

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Admin proxy istegi basarisiz oldu.',
      },
      { status: 502 },
    );
  }
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, await context.params);
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, await context.params);
}

export async function PATCH(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, await context.params);
}

export async function PUT(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, await context.params);
}

export async function DELETE(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, await context.params);
}

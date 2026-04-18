import { NextResponse } from 'next/server';

import { backendFetch } from '@/lib/backend';
import { toErrorResponse } from '@/lib/route-error';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await backendFetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}

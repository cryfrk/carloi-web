import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { backendFetch, SESSION_COOKIE } from '@/lib/backend';
import { toErrorResponse } from '@/lib/route-error';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value || '';

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: 'Oturum bulunamadı.',
      },
      { status: 401 },
    );
  }

  try {
    const data = await backendFetch('/api/bootstrap', {
      method: 'GET',
      token,
    });

    return NextResponse.json(data);
  } catch (error) {
    cookieStore.delete(SESSION_COOKIE);
    return toErrorResponse(error);
  }
}

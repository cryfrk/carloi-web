import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { backendFetch, SESSION_COOKIE } from '@/lib/backend';
import { toErrorResponse } from '@/lib/route-error';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value || '';

    if (token) {
      try {
        await backendFetch('/api/auth/logout', {
          method: 'POST',
          token,
        });
      } catch {
        // Kullanıcı deneyimi için local cookie her durumda temizlenir.
      }
    }

    cookieStore.delete(SESSION_COOKIE);
    return NextResponse.json({ success: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}

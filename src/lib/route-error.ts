import { NextResponse } from 'next/server';

export function toErrorResponse(error: unknown) {
  return NextResponse.json(
    {
      success: false,
      message: error instanceof Error ? error.message : 'İstek işlenemedi.',
    },
    {
      status:
        typeof error === 'object' && error && 'statusCode' in error && typeof error.statusCode === 'number'
          ? error.statusCode
          : 500,
    },
  );
}

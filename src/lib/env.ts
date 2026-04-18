const requireEnv = (value: string | undefined, fallback = '') => String(value || fallback).trim();

export const webEnv = {
  apiBaseUrl: requireEnv(process.env.NEXT_PUBLIC_API_BASE_URL, 'http://localhost:8080'),
  shareBaseUrl: requireEnv(process.env.NEXT_PUBLIC_SHARE_BASE_URL, 'http://localhost:3000'),
  appName: requireEnv(process.env.NEXT_PUBLIC_APP_NAME, 'Carloi'),
  sessionCookieName: 'carloi_web_session',
};

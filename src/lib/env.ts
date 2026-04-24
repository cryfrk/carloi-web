const DEFAULT_API_BASE_URL = 'https://api.carloi.com';
const requireEnv = (value: string | undefined, fallback = '') => String(value || fallback).trim();

export const webEnv = {
  apiBaseUrl: requireEnv(process.env.NEXT_PUBLIC_API_BASE_URL, DEFAULT_API_BASE_URL),
  shareBaseUrl: requireEnv(process.env.NEXT_PUBLIC_SHARE_BASE_URL, 'http://localhost:3000'),
  appName: requireEnv(process.env.NEXT_PUBLIC_APP_NAME, 'Carloi'),
  sessionCookieName: 'carloi_web_session',
  supportEmail: requireEnv(process.env.NEXT_PUBLIC_SUPPORT_EMAIL, 'support@carloi.com'),
  privacyUrl: requireEnv(
    process.env.NEXT_PUBLIC_PRIVACY_URL,
    `${requireEnv(process.env.NEXT_PUBLIC_SHARE_BASE_URL, 'http://localhost:3000')}/privacy`,
  ),
  termsUrl: requireEnv(
    process.env.NEXT_PUBLIC_TERMS_URL,
    `${requireEnv(process.env.NEXT_PUBLIC_SHARE_BASE_URL, 'http://localhost:3000')}/terms`,
  ),
};

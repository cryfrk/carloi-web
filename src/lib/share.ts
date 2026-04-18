import { webEnv } from '@/lib/env';

export const shareRoutes = {
  post: (postId: string) => `${webEnv.shareBaseUrl}/p/${postId}`,
  listing: (listingId: string) => `${webEnv.shareBaseUrl}/listing/${listingId}`,
  profile: (handle: string) =>
    `${webEnv.shareBaseUrl}/profile/${encodeURIComponent(String(handle || '').replace(/^@/, ''))}`,
};

import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: false,
  output: 'standalone',
  outputFileTracingRoot: path.join(process.cwd(), '..'),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;

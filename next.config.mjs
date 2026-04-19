/** @type {import('next').NextConfig} */
const isDockerBuild = process.env.DOCKER_BUILD === 'true';

const nextConfig = {
  typedRoutes: false,
  outputFileTracingRoot: process.cwd(),
  ...(isDockerBuild ? { output: 'standalone' } : {}),
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

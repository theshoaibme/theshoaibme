import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/cv',
        destination: '/resume',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Next.js 16에서 Turbopack 사용 시 webpack 설정이 있으면
  // 반드시 experimental.turbo 설정(비어있더라도) 명시
  experimental: {
    turbo: {
      resolveAlias: {
        fs: 'empty-module',
        path: 'empty-module',
      },
    },
  } as never, // 👈 타입 정의 미흡으로 인한 'turbo' 키 오류 해결

  // 하위 호환 및 특정 환경용 webpack 설정
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
  /* config options here */
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default nextConfig;

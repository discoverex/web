import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // 1. Turbopack 설정 (Next.js 16+ 대응)
  experimental: {
    turbo: {
      resolveAlias: {
        // 브라우저에서 필요 없는 노드 모듈을 빈 모듈로 대체
        fs: "empty-module",
        path: "empty-module",
      },
    },
  },

  // 2. 기존 Webpack 설정 (하위 호환 및 특정 빌드 환경용)
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
  /* config options here */
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;

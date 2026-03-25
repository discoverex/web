import type { NextConfig } from 'next';
import path from 'path';
import fs from 'fs';

const sharedEnvPath = path.resolve(process.cwd(), '../../.env');
if (fs.existsSync(sharedEnvPath)) {
  for (const line of fs.readFileSync(sharedEnvPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

const nextConfig: NextConfig = {
  // 1. 보안 헤더: SharedArrayBuffer 활성화 (WASM 멀티스레딩 필수)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
    ];
  },
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

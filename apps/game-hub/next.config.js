/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**', // 모든 경로 허용
      },

      {
        protocol: 'http',
        hostname: 'googleusercontent.com',
        port: '',
        pathname: '/profile/picture/**',
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    if (process.env.NEXT_PUBLIC_APP_URL === 'http://localhost:3000') {
      return [];
    } else {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains; preload',
            },
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                // "connect-src 'self' https://us.i.posthog.com https://us-assets.i.posthog.com",
                // "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://us-assets.i.posthog.com",
                "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' blob: data: https:",
                "font-src 'self' data:",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
                'upgrade-insecure-requests',
              ].join('; '),
            },
          ],
        },
      ];
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;

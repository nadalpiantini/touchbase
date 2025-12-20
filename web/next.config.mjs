import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/config.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // TypeScript - ignore build errors temporarily (P1: fix type mismatches)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Performance optimizations
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Compress responses
  compress: true,

  // Experimental features for performance
  experimental: {
    optimizePackageImports: ['@/components/ui', 'next-intl'],
  },

  // Proxy configuration for legacy PHP app
  async rewrites() {
    return [
      {
        // Route all /legacy/* requests to the PHP app
        source: "/legacy/:path*",
        destination: process.env.NODE_ENV === "production"
          ? "https://legacy.sujeto10.com/:path*"  // Production legacy URL
          : "http://localhost:8080/:path*",       // Local development PHP server
      },
    ];
  },

  // Headers configuration for security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
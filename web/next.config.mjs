import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/config.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Disable ESLint during builds temporarily
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during builds temporarily
  typescript: {
    ignoreBuildErrors: true,
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
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
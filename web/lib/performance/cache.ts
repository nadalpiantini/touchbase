// Cache configuration for API routes and static assets

export const CACHE_CONFIG = {
  // API route cache times (in seconds)
  api: {
    short: 60, // 1 minute
    medium: 300, // 5 minutes
    long: 3600, // 1 hour
    static: 86400, // 24 hours
  },
  
  // Static asset cache times
  static: {
    images: 31536000, // 1 year
    fonts: 31536000, // 1 year
    scripts: 86400, // 24 hours
    styles: 86400, // 24 hours
  },
};

// Cache headers helper
export function getCacheHeaders(maxAge: number, staleWhileRevalidate?: number) {
  return {
    'Cache-Control': `public, s-maxage=${maxAge}${staleWhileRevalidate ? `, stale-while-revalidate=${staleWhileRevalidate}` : ''}`,
  };
}

// Revalidation helper for Next.js
export function getRevalidateTime(seconds: number) {
  return seconds;
}


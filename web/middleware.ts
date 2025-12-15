import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

// Create the i18n middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed' // Only add locale prefix when not using default locale
});

export async function middleware(request: NextRequest) {
  // Skip middleware for root path - serve app/page.tsx directly without locale
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next();
  }
  
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - legacy (PHP proxy)
     * - root path (/) - handled separately in middleware function
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|legacy).*)",
  ],
};
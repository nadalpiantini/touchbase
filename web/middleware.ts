import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

// Create the i18n middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed' // Don't add locale prefix for default locale
});

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle locale detection first
  const intlResponse = intlMiddleware(request);

  // Skip auth middleware for public routes
  const publicPaths = ["/", "/login", "/signup", "/api/auth"];
  const isPublicRoute = publicPaths.some((route) =>
    pathname === route ||
    pathname.startsWith("/en" + route) ||
    pathname.startsWith("/es" + route) ||
    pathname.startsWith("/api/auth/")
  );

  if (isPublicRoute) {
    return intlResponse;
  }

  // Create response based on intl middleware
  const response = intlResponse || NextResponse.next();

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
            sameSite: "lax",
            httpOnly: true,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete(name);
        },
      },
    }
  );

  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser();

  // Protected routes check
  const protectedPaths = ["/dashboard"];
  const isProtectedRoute = protectedPaths.some((route) =>
    pathname.startsWith(route) ||
    pathname.startsWith("/en" + route) ||
    pathname.startsWith("/es" + route)
  );

  if (isProtectedRoute && (!user || error)) {
    // Redirect to login if not authenticated, preserving locale
    const locale = pathname.startsWith("/en") ? "/en" : pathname.startsWith("/es") ? "/es" : "";
    return NextResponse.redirect(new URL(`${locale}/login`, request.url));
  }

  // Redirect to dashboard if authenticated and on login page
  const loginPaths = ["/login", "/en/login", "/es/login"];
  if (user && loginPaths.includes(pathname)) {
    const locale = pathname.startsWith("/en") ? "/en" : pathname.startsWith("/es") ? "/es" : "";
    return NextResponse.redirect(new URL(`${locale}/dashboard`, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - legacy (PHP proxy)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|legacy).*)",
  ],
};
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { locales, defaultLocale } from './i18n/config';

// Create the i18n middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always' // SEO best practice: always show locale in URL
});

export async function middleware(request: NextRequest) {
  // First, let i18n middleware handle the request
  const response = intlMiddleware(request);

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on the response
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh the session - this syncs the auth state between client and server
  // and refreshes expired tokens automatically
  await supabase.auth.getSession();

  return response;
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
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|legacy).*)",
  ],
};

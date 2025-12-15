import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Cookies can only be set in Server Components, Server Actions, or Route Handlers
            // This is expected in some contexts
          }
        },
      },
    }
  );
}

/**
 * Admin client with SERVICE_ROLE key - bypasses RLS
 * Only use for server-side operations that need elevated permissions
 * e.g., dev mode seeding, admin operations, webhooks
 */
export function supabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE is required for admin operations");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
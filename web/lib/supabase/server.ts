import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function supabaseServer() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const store = await cookieStore;
          return store.get(name)?.value;
        },
        async set(name: string, value: string, options: any) {
          // Server components cannot set cookies directly
          // This will be handled by middleware/route handlers
          const store = await cookieStore;
          store.set(name, value, options);
        },
        async remove(name: string, options: any) {
          // Server components cannot remove cookies directly
          // This will be handled by middleware/route handlers
          const store = await cookieStore;
          store.delete(name);
        },
      },
    }
  );
}
import "server-only";
import { createClient } from "@supabase/supabase-js";

// Admin client for server-side operations
// Uses service role key for full database access
// Note: This should only be used in server-side code
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
  {
    auth: {
      persistSession: false,
    },
  }
);
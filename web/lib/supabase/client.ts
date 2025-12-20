"use client";
import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

// Singleton instance to prevent multiple GoTrueClient warnings
// We store it on globalThis to ensure true singleton across module reloads
declare global {
  var __supabaseClient: SupabaseClient | undefined;
}

// Create the Supabase client only once using SSR package for cookie-based sessions
function getSupabaseClient(): SupabaseClient {
  // Return existing client if it exists
  if (globalThis.__supabaseClient) {
    return globalThis.__supabaseClient;
  }

  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    });
    throw new Error("Supabase configuration is missing. Please check your environment variables.");
  }

  // Create new client using @supabase/ssr for cookie-based session storage
  // This ensures sessions sync between client and server via middleware
  const client = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );

  // Store globally to persist across HMR and module reloads
  if (typeof window !== "undefined") {
    globalThis.__supabaseClient = client;
  }

  return client;
}

// Export singleton getter function (for backwards compatibility)
export const supabaseBrowser = () => getSupabaseClient();

// Export a lazy-initialized singleton for module-level usage
// This uses a getter to ensure the client is only created when accessed
let _clientInstance: SupabaseClient | undefined;

export const supabaseClient = typeof window !== "undefined"
  ? (() => {
      if (!_clientInstance) {
        _clientInstance = getSupabaseClient();
      }
      return _clientInstance;
    })()
  : undefined;

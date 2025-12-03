"use client";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Singleton instance to prevent multiple GoTrueClient warnings
// We store it on globalThis to ensure true singleton across module reloads
declare global {
  var __supabaseClient: SupabaseClient | undefined;
}

// Create the Supabase client only once
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

  // Create new client and store it globally
  const client = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "touchbase-auth",
        flowType: "pkce"
      }
    }
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
"use client";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Singleton instance to prevent multiple GoTrueClient warnings
// We store it on globalThis to ensure true singleton across module reloads
declare global {
  var supabaseClientSingleton: SupabaseClient | undefined;
  var supabaseClientInitializing: boolean | undefined;
}

// Create and export singleton instance immediately
let clientInstance: SupabaseClient | undefined;

function createSupabaseClient() {
  // Check if we already have a client instance
  if (clientInstance) {
    return clientInstance;
  }

  // Check if we already have a client on globalThis (persists across HMR)
  if (globalThis.supabaseClientSingleton) {
    clientInstance = globalThis.supabaseClientSingleton;
    return clientInstance;
  }

  // Prevent race conditions during initialization
  if (globalThis.supabaseClientInitializing) {
    // Wait for the other initialization to complete
    const waitForInit = () => {
      if (globalThis.supabaseClientSingleton) {
        clientInstance = globalThis.supabaseClientSingleton;
        return clientInstance;
      }
      // This shouldn't happen, but fallback to creating new if needed
      return createSupabaseClient();
    };
    return waitForInit();
  }

  // Mark that we're initializing
  globalThis.supabaseClientInitializing = true;

  // Create client only once
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Add storage key to ensure consistent storage
        storageKey: "touchbase-auth",
        // Add flow type to optimize for PKCE
        flowType: "pkce"
      }
    }
  );

  // Store on globalThis to persist across module reloads
  if (typeof window !== "undefined") {
    globalThis.supabaseClientSingleton = client;
    clientInstance = client;
  }

  // Clear initializing flag
  globalThis.supabaseClientInitializing = false;

  return client;
}

// Export singleton getter function
export const supabaseBrowser = () => createSupabaseClient();

// Also export a direct reference for module-level usage
export const supabaseClient = typeof window !== "undefined" ? createSupabaseClient() : undefined;
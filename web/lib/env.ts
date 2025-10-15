// Environment variable validation
const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const ENV = {
  NEXT_PUBLIC_SUPABASE_URL: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE: requireEnv("SUPABASE_SERVICE_ROLE"),
  SUPABASE_JWT_SECRET: requireEnv("SUPABASE_JWT_SECRET"),
} as const;

// Validate on import (catches missing vars early)
if (typeof window === "undefined") {
  // Server-side validation
  Object.values(ENV);
}
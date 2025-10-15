import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const keys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE",
  "SUPABASE_JWT_SECRET",
] as const;

let ok = true;
for (const k of keys) {
  if (!process.env[k]) {
    console.error(`❌ Missing ${k}`);
    ok = false;
  }
}

if (!ok) {
  console.error("\n⚠️  Please configure your .env.local file with Supabase credentials");
  process.exit(1);
}

console.log("✅ Environment variables OK");
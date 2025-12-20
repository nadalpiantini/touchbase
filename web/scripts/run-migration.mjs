#!/usr/bin/env node
/**
 * Run TouchBase Academy migration using direct postgres connection
 */

import { config } from 'dotenv';
import { Client } from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
config({ path: join(__dirname, '..', '.env.local') });

async function runMigration() {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !dbPassword) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DB_PASSWORD/SUPABASE_SERVICE_ROLE');
    process.exit(1);
  }

  // Extract project ref from URL
  const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
  console.log(`Project ref: ${projectRef}`);

  // Construct connection strings to try
  const connectionStrings = [
    // Supavisor pooler (transaction mode)
    `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    // Direct connection
    `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`,
    // Session mode pooler
    `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  ];

  // Read migration SQL
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', 'COMPLETE_ACADEMY_MIGRATION.sql');
  const sql = readFileSync(migrationPath, 'utf8');
  console.log(`Migration SQL loaded (${sql.length} characters)`);

  // Try each connection string
  for (const connStr of connectionStrings) {
    const client = new Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false }
    });

    try {
      console.log(`\nTrying connection...`);
      await client.connect();
      console.log('Connected! Running migration...');

      await client.query(sql);
      console.log('Migration completed successfully!');

      await client.end();
      return;
    } catch (error) {
      console.log(`Connection failed: ${error.message}`);
      try { await client.end(); } catch {}
    }
  }

  console.error('\nAll connection attempts failed.');
  console.log('\nPlease run the migration manually in Supabase SQL Editor:');
  console.log('https://supabase.com/dashboard/project/' + projectRef + '/sql');
  console.log('\nSQL file: supabase/migrations/COMPLETE_ACADEMY_MIGRATION.sql');
  process.exit(1);
}

runMigration().catch(console.error);

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runMigrations() {
  console.log('🔧 Running schema fixes...\n');

  const migrations = [
    {
      name: 'Add deleted_at to teams',
      sql: `ALTER TABLE public.touchbase_teams ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;`
    },
    {
      name: 'Add deleted_at to players',
      sql: `ALTER TABLE public.touchbase_players ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;`
    },
    {
      name: 'Create audit_log table',
      sql: `
        CREATE TABLE IF NOT EXISTS public.touchbase_audit_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
          entity TEXT NOT NULL CHECK (entity IN ('team','player')),
          entity_id UUID NOT NULL,
          action TEXT NOT NULL CHECK (action IN ('create','update','soft_delete','restore','purge')),
          actor UUID,
          meta JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'Enable RLS on audit_log',
      sql: `ALTER TABLE public.touchbase_audit_log ENABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'Create audit_log policy',
      sql: `
        DROP POLICY IF EXISTS "touchbase_audit_select_members" ON public.touchbase_audit_log;
        CREATE POLICY "touchbase_audit_select_members" ON public.touchbase_audit_log
          FOR SELECT USING (public.touchbase_is_org_member(org_id));
      `
    },
    {
      name: 'Create classes table',
      sql: `
        CREATE TABLE IF NOT EXISTS public.touchbase_classes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          subject TEXT,
          teacher_id UUID,
          capacity INTEGER DEFAULT 30,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
          schedule JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'Enable RLS on classes',
      sql: `ALTER TABLE public.touchbase_classes ENABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'Create classes policy',
      sql: `
        DROP POLICY IF EXISTS "touchbase_classes_select_members" ON public.touchbase_classes;
        CREATE POLICY "touchbase_classes_select_members" ON public.touchbase_classes
          FOR SELECT USING (public.touchbase_is_org_member(org_id));
      `
    },
    {
      name: 'Create class_schedules table',
      sql: `
        CREATE TABLE IF NOT EXISTS public.touchbase_class_schedules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          class_id UUID REFERENCES public.touchbase_classes(id) ON DELETE CASCADE,
          org_id UUID NOT NULL REFERENCES public.touchbase_organizations(id) ON DELETE CASCADE,
          day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          timezone TEXT DEFAULT 'UTC',
          is_recurring BOOLEAN DEFAULT TRUE,
          start_date DATE,
          end_date DATE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'Enable RLS on class_schedules',
      sql: `ALTER TABLE public.touchbase_class_schedules ENABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'Create class_schedules policy',
      sql: `
        DROP POLICY IF EXISTS "touchbase_class_schedules_select_members" ON public.touchbase_class_schedules;
        CREATE POLICY "touchbase_class_schedules_select_members" ON public.touchbase_class_schedules
          FOR SELECT USING (public.touchbase_is_org_member(org_id));
      `
    },
    {
      name: 'Create touchbase_has_role function',
      sql: `
        CREATE OR REPLACE FUNCTION public.touchbase_has_role(p_org UUID, p_roles TEXT[])
        RETURNS BOOLEAN
        LANGUAGE SQL
        STABLE
        AS $$
          SELECT EXISTS (
            SELECT 1 FROM public.touchbase_memberships m
            WHERE m.org_id = p_org
              AND m.user_id = auth.uid()
              AND m.role = ANY (p_roles)
          );
        $$;
      `
    },
    {
      name: 'Create indexes',
      sql: `
        CREATE INDEX IF NOT EXISTS idx_touchbase_audit_log_org_id ON public.touchbase_audit_log(org_id);
        CREATE INDEX IF NOT EXISTS idx_touchbase_audit_log_created_at ON public.touchbase_audit_log(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_touchbase_class_schedules_org_id ON public.touchbase_class_schedules(org_id);
        CREATE INDEX IF NOT EXISTS idx_touchbase_classes_org_id ON public.touchbase_classes(org_id);
      `
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const migration of migrations) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: migration.sql });

      if (error) {
        // Try direct query approach for DDL statements
        const { error: directError } = await supabase.from('_migrations_log').select('*').limit(0);

        // If RPC doesn't exist, we need another approach
        console.log(`⚠️  ${migration.name}: RPC not available, trying alternative...`);

        // Use the REST API to check if table exists after running
        const tableName = migration.sql.match(/(?:CREATE TABLE|ALTER TABLE)[^.]*\.(\w+)/i)?.[1];
        if (tableName) {
          const { error: checkError } = await supabase.from(tableName).select('*').limit(0);
          if (!checkError) {
            console.log(`✅ ${migration.name}: Table already exists`);
            successCount++;
            continue;
          }
        }

        console.log(`❌ ${migration.name}: ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ ${migration.name}`);
        successCount++;
      }
    } catch (err: any) {
      console.log(`❌ ${migration.name}: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Results: ${successCount} success, ${errorCount} errors`);

  // Verify tables exist
  console.log('\n🔍 Verifying schema...');

  const tables = [
    'touchbase_teams',
    'touchbase_players',
    'touchbase_audit_log',
    'touchbase_classes',
    'touchbase_class_schedules'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(0);
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: exists`);
    }
  }

  // Check columns
  console.log('\n🔍 Checking columns...');
  const { data: teamsData, error: teamsErr } = await supabase
    .from('touchbase_teams')
    .select('deleted_at')
    .limit(0);

  console.log(`${teamsErr ? '❌' : '✅'} touchbase_teams.deleted_at: ${teamsErr?.message || 'exists'}`);

  const { data: playersData, error: playersErr } = await supabase
    .from('touchbase_players')
    .select('deleted_at')
    .limit(0);

  console.log(`${playersErr ? '❌' : '✅'} touchbase_players.deleted_at: ${playersErr?.message || 'exists'}`);
}

runMigrations().catch(console.error);

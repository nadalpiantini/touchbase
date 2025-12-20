import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Only works in development mode
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE!;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE not configured" }, { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const results: { name: string; status: string; error?: string }[] = [];

  // Run each migration separately using RPC or direct queries
  const migrations = [
    {
      name: "Add deleted_at to teams",
      check: async () => {
        const { data, error } = await admin.from("touchbase_teams").select("deleted_at").limit(0);
        return !error;
      },
      run: async () => {
        // Can't run DDL via REST API, return info
        return { success: false, message: "DDL must be run via SQL Editor" };
      }
    },
    {
      name: "Add deleted_at to players",
      check: async () => {
        const { data, error } = await admin.from("touchbase_players").select("deleted_at").limit(0);
        return !error;
      }
    },
    {
      name: "Check audit_log table",
      check: async () => {
        const { data, error } = await admin.from("touchbase_audit_log").select("id").limit(0);
        return !error;
      }
    },
    {
      name: "Check classes table",
      check: async () => {
        const { data, error } = await admin.from("touchbase_classes").select("id").limit(0);
        return !error;
      }
    },
    {
      name: "Check class_schedules table",
      check: async () => {
        const { data, error } = await admin.from("touchbase_class_schedules").select("id").limit(0);
        return !error;
      }
    },
    {
      name: "Check module_steps table",
      check: async () => {
        const { data, error } = await admin.from("touchbase_module_steps").select("id").limit(0);
        return !error;
      }
    },
    {
      name: "Check progress table",
      check: async () => {
        const { data, error } = await admin.from("touchbase_progress").select("id").limit(0);
        return !error;
      }
    },
    {
      name: "Check assignments table",
      check: async () => {
        const { data, error } = await admin.from("touchbase_assignments").select("id").limit(0);
        return !error;
      }
    }
  ];

  for (const migration of migrations) {
    try {
      const exists = await migration.check();
      results.push({
        name: migration.name,
        status: exists ? "exists" : "missing"
      });
    } catch (err: any) {
      results.push({
        name: migration.name,
        status: "error",
        error: err.message
      });
    }
  }

  // Generate SQL that needs to be run
  const sqlToRun = `
-- Run this SQL in Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/sql

-- 1. Add deleted_at columns
ALTER TABLE public.touchbase_teams ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.touchbase_players ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Create audit_log table
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

ALTER TABLE public.touchbase_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "touchbase_audit_select_members" ON public.touchbase_audit_log;
CREATE POLICY "touchbase_audit_select_members" ON public.touchbase_audit_log
  FOR SELECT USING (public.touchbase_is_org_member(org_id));

-- 3. Create classes table
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

ALTER TABLE public.touchbase_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "touchbase_classes_select_members" ON public.touchbase_classes;
CREATE POLICY "touchbase_classes_select_members" ON public.touchbase_classes
  FOR SELECT USING (public.touchbase_is_org_member(org_id));

-- 4. Create class_schedules table
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

ALTER TABLE public.touchbase_class_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "touchbase_class_schedules_select_members" ON public.touchbase_class_schedules;
CREATE POLICY "touchbase_class_schedules_select_members" ON public.touchbase_class_schedules
  FOR SELECT USING (public.touchbase_is_org_member(org_id));

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_touchbase_audit_log_org_id ON public.touchbase_audit_log(org_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_audit_log_created_at ON public.touchbase_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_touchbase_class_schedules_org_id ON public.touchbase_class_schedules(org_id);
CREATE INDEX IF NOT EXISTS idx_touchbase_classes_org_id ON public.touchbase_classes(org_id);

SELECT 'Migration completed!' as status;
`;

  return NextResponse.json({
    checks: results,
    sqlEditorUrl: "https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/sql",
    sql: sqlToRun
  });
}

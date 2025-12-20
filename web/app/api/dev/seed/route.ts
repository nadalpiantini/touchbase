import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

// Dev seed data with consistent UUIDs
const DEV_ORG_ID = "00000000-0000-0000-0000-000000000001";
const DEV_USER_ID = "00000000-0000-0000-0000-000000000002"; // Owner
const DEV_TEACHER_ID = "00000000-0000-0000-0000-000000000003";
const DEV_STUDENT_ID = "00000000-0000-0000-0000-000000000004";
const DEV_CLASS_ID = "00000000-0000-0000-0000-000000000010";
const DEV_MODULE_ID = "00000000-0000-0000-0000-000000000020";
const DEV_MODULE_STEP_ID = "00000000-0000-0000-0000-000000000021";
const DEV_ASSIGNMENT_ID = "00000000-0000-0000-0000-000000000030";

// SQL to create missing academy tables
const CREATE_ACADEMY_TABLES_SQL = `
-- Create touchbase_module_steps table if not exists
CREATE TABLE IF NOT EXISTS public.touchbase_module_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.touchbase_modules(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  step_type TEXT NOT NULL CHECK (step_type IN ('content', 'quiz', 'scenario')),
  content_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create touchbase_progress table if not exists
CREATE TABLE IF NOT EXISTS public.touchbase_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID NOT NULL REFERENCES public.touchbase_modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  total_time_seconds INTEGER NOT NULL DEFAULT 0,
  score INTEGER,
  step_progress JSONB NOT NULL DEFAULT '[]',
  started_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Create touchbase_assignments table if not exists
CREATE TABLE IF NOT EXISTS public.touchbase_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.touchbase_classes(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.touchbase_modules(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_module_steps_module_id ON public.touchbase_module_steps(module_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.touchbase_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_module_id ON public.touchbase_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON public.touchbase_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_module_id ON public.touchbase_assignments(module_id);

-- Enable RLS on new tables
ALTER TABLE public.touchbase_module_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.touchbase_assignments ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (allow all for now - dev mode)
DROP POLICY IF EXISTS "Allow all module_steps" ON public.touchbase_module_steps;
CREATE POLICY "Allow all module_steps" ON public.touchbase_module_steps FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all progress" ON public.touchbase_progress;
CREATE POLICY "Allow all progress" ON public.touchbase_progress FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all assignments" ON public.touchbase_assignments;
CREATE POLICY "Allow all assignments" ON public.touchbase_assignments FOR ALL USING (true);
`;

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Seed endpoint only available in development" },
      { status: 403 }
    );
  }

  try {
    const admin = supabaseAdmin();

    // 0. Create academy tables if they don't exist
    console.log("Creating academy tables if needed...");
    const { error: sqlError } = await admin.rpc('exec_sql', { sql: CREATE_ACADEMY_TABLES_SQL });

    // If exec_sql doesn't exist, try running SQL directly via postgrest
    // The tables may already exist or will be created by the upserts below
    if (sqlError) {
      console.log("Note: exec_sql not available, tables may need manual creation:", sqlError.message);
    }

    // 1. Create dev organization (upsert to avoid duplicates)
    const { data: org, error: orgError } = await admin
      .from("touchbase_organizations")
      .upsert(
        {
          id: DEV_ORG_ID,
          name: "Dev Organization",
          slug: "dev-org",
          logo_url: null,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (orgError) {
      console.error("Error creating org:", orgError);
      return NextResponse.json({ error: orgError.message }, { status: 500 });
    }

    // 2. Create dev profile (upsert)
    const { data: profile, error: profileError } = await admin
      .from("touchbase_profiles")
      .upsert(
        {
          id: DEV_USER_ID,
          email: "dev@touchbase.local",
          full_name: "Dev User (Owner)",
          default_org_id: DEV_ORG_ID,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (profileError) {
      console.error("Error creating profile:", profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // 3. Create dev membership (upsert) - Owner
    const { data: membership, error: membershipError } = await admin
      .from("touchbase_memberships")
      .upsert(
        {
          org_id: DEV_ORG_ID,
          user_id: DEV_USER_ID,
          role: "owner",
        },
        { onConflict: "org_id,user_id" }
      )
      .select()
      .single();

    if (membershipError) {
      console.error("Error creating membership:", membershipError);
      return NextResponse.json({ error: membershipError.message }, { status: 500 });
    }

    // 4. Create Teacher profile and membership
    await admin.from("touchbase_profiles").upsert(
      {
        id: DEV_TEACHER_ID,
        email: "teacher@touchbase.local",
        full_name: "Dev Teacher",
        default_org_id: DEV_ORG_ID,
      },
      { onConflict: "id" }
    );

    await admin.from("touchbase_memberships").upsert(
      {
        org_id: DEV_ORG_ID,
        user_id: DEV_TEACHER_ID,
        role: "teacher",
      },
      { onConflict: "org_id,user_id" }
    );

    // 5. Create Student profile and membership
    await admin.from("touchbase_profiles").upsert(
      {
        id: DEV_STUDENT_ID,
        email: "student@touchbase.local",
        full_name: "Dev Student",
        default_org_id: DEV_ORG_ID,
      },
      { onConflict: "id" }
    );

    await admin.from("touchbase_memberships").upsert(
      {
        org_id: DEV_ORG_ID,
        user_id: DEV_STUDENT_ID,
        role: "student",
      },
      { onConflict: "org_id,user_id" }
    );

    // 6. Create a test class
    await admin.from("touchbase_classes").upsert(
      {
        id: DEV_CLASS_ID,
        org_id: DEV_ORG_ID,
        teacher_id: DEV_TEACHER_ID,
        name: "Life Skills 101",
        description: "Introduction to essential life skills",
        grade_level: "High School",
        code: "LIFE01",
      },
      { onConflict: "id" }
    );

    // 7. Enroll student in class
    await admin.from("touchbase_class_enrollments").upsert(
      {
        class_id: DEV_CLASS_ID,
        student_id: DEV_STUDENT_ID,
      },
      { onConflict: "class_id,student_id" }
    );

    // 8. Create a test module
    await admin.from("touchbase_modules").upsert(
      {
        id: DEV_MODULE_ID,
        created_by: DEV_TEACHER_ID,
        title: "Financial Literacy Basics",
        description: "Learn the fundamentals of managing your money",
        difficulty: "beginner",
        duration_minutes: 30,
        skills: ["budgeting", "saving", "financial-planning"],
        is_active: true,
      },
      { onConflict: "id" }
    );

    return NextResponse.json({
      success: true,
      message: "Dev seed data created successfully",
      data: {
        org,
        profile,
        membership,
        ids: {
          DEV_ORG_ID,
          DEV_USER_ID,
          DEV_TEACHER_ID,
          DEV_STUDENT_ID,
          DEV_CLASS_ID,
          DEV_MODULE_ID,
        },
        testUsers: [
          { email: "dev@touchbase.local", role: "owner", id: DEV_USER_ID },
          { email: "teacher@touchbase.local", role: "teacher", id: DEV_TEACHER_ID },
          { email: "student@touchbase.local", role: "student", id: DEV_STUDENT_ID },
        ],
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET: Check if seed data exists
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Seed endpoint only available in development" },
      { status: 403 }
    );
  }

  try {
    const admin = supabaseAdmin();

    const { data: org } = await admin
      .from("touchbase_organizations")
      .select("*")
      .eq("id", DEV_ORG_ID)
      .single();

    const { data: profile } = await admin
      .from("touchbase_profiles")
      .select("*")
      .eq("id", DEV_USER_ID)
      .single();

    const { data: membership } = await admin
      .from("touchbase_memberships")
      .select("*")
      .eq("org_id", DEV_ORG_ID)
      .eq("user_id", DEV_USER_ID)
      .single();

    return NextResponse.json({
      exists: !!(org && profile && membership),
      data: {
        org: org || null,
        profile: profile || null,
        membership: membership || null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

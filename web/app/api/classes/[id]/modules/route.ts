import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { assignModuleToClass, unassignModuleFromClass } from "@/lib/services/class-modules";
import { requireTeacher } from "@/lib/auth/middleware-helpers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;
    const s = await supabaseServer();
    await requireTeacher(s);

    const body = await req.json();
    const { module_id } = body;

    if (!module_id) {
      return NextResponse.json(
        { error: "module_id is required" },
        { status: 400 }
      );
    }

    await assignModuleToClass(s, classId, module_id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : String(error)) || "Failed to assign module" },
      { status: 400 }
    );
  }
}


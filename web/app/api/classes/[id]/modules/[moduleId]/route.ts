import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { unassignModuleFromClass } from "@/lib/services/class-modules";
import { requireTeacher } from "@/lib/auth/middleware-helpers";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { id: classId, moduleId } = await params;
    const s = supabaseServer();
    await requireTeacher(s);

    await unassignModuleFromClass(s, classId, moduleId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Unassign module error:", error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : String(error)) || "Failed to unassign module" },
      { status: 400 }
    );
  }
}


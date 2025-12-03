import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { deleteAssignment } from "@/lib/services/assignments";
import { requireTeacher } from "@/lib/auth/middleware-helpers";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const s = supabaseServer();
    await requireTeacher(s);

    await deleteAssignment(s, id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete assignment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete assignment" },
      { status: 400 }
    );
  }
}


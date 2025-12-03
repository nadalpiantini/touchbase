import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getClassById } from "@/lib/services/classes";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const s = supabaseServer();
    await requireAuth(s);

    const classItem = await getClassById(s, id);

    if (!classItem) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ class: classItem });
  } catch (error: any) {
    console.error("Get class error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get class" },
      { status: 400 }
    );
  }
}


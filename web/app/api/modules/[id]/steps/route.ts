import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { addModuleStep, updateModuleStep, deleteModuleStep } from "@/lib/services/modules";
import { requireTeacher } from "@/lib/auth/middleware-helpers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const s = await supabaseServer();
    const user = await requireTeacher(s);
    const { id: moduleId } = await params;

    const { order_index, step_type, content_data } = await req.json();

    if (!order_index || !step_type || !content_data) {
      return NextResponse.json(
        { error: "Order index, step type, and content data are required" },
        { status: 400 }
      );
    }

    const step = await addModuleStep(s, moduleId, {
      order_index,
      step_type,
      content_data,
    });

    return NextResponse.json({ step });
  } catch (error: unknown) {
    console.error("Create step error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create step" },
      { status: 400 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const s = await supabaseServer();
    await requireTeacher(s);
    const { id: moduleId } = await params;

    const { stepId, content_data, order_index } = await req.json();

    if (!stepId) {
      return NextResponse.json({ error: "Step ID is required" }, { status: 400 });
    }

    const step = await updateModuleStep(s, stepId, {
      content_data,
      order_index,
    });

    return NextResponse.json({ step });
  } catch (error: unknown) {
    console.error("Update step error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update step" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const s = await supabaseServer();
    await requireTeacher(s);
    const { id: moduleId } = await params;

    const url = new URL(req.url);
    const stepId = url.searchParams.get("stepId");

    if (!stepId) {
      return NextResponse.json({ error: "Step ID is required" }, { status: 400 });
    }

    await deleteModuleStep(s, stepId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Delete step error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete step" },
      { status: 400 }
    );
  }
}


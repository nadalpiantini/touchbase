import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getAIExplanation } from "@/lib/services/ai";
import { requireAuth } from "@/lib/auth/middleware-helpers";

export async function POST(req: Request) {
  try {
    const s = supabaseServer();
    await requireAuth(s);

    const { moduleTitle, question, correctAnswer, studentAnswer } = await req.json();

    if (!moduleTitle || !question || !correctAnswer) {
      return NextResponse.json(
        { error: "Module title, question, and correct answer are required" },
        { status: 400 }
      );
    }

    const explanation = await getAIExplanation(
      s,
      moduleTitle,
      question,
      correctAnswer,
      studentAnswer
    );

    return NextResponse.json({ explanation });
  } catch (error: any) {
    console.error("Get AI explanation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get AI explanation" },
      { status: 400 }
    );
  }
}


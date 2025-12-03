// ============================================================
// TouchBase Academy - AI Service
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";

export type AIProvider = "openai" | "gemini";

export interface AIGatewayRequest {
  prompt: string;
  provider?: AIProvider;
  context?: string;
}

export interface AIGatewayResponse {
  response: string;
  provider: AIProvider;
  timestamp: string;
}

/**
 * Call AI gateway Edge Function
 */
export async function callAIGateway(
  supabase: SupabaseClient,
  request: AIGatewayRequest
): Promise<AIGatewayResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("Supabase URL not configured");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/ai-gateway`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to call AI gateway");
  }

  return await response.json();
}

/**
 * Get AI hint for a module step
 */
export async function getAIHint(
  supabase: SupabaseClient,
  moduleTitle: string,
  stepContent: string,
  question?: string
): Promise<string> {
  const context = `You are helping a student learn about "${moduleTitle}". The current step content is: ${stepContent}`;
  const prompt = question
    ? `The student is asking: "${question}". Provide a helpful hint without giving away the answer.`
    : "Provide a helpful hint for this learning step without giving away the answer.";

  const result = await callAIGateway(supabase, {
    prompt,
    context,
    provider: "openai",
  });

  return result.response;
}

/**
 * Get AI explanation for a quiz answer
 */
export async function getAIExplanation(
  supabase: SupabaseClient,
  moduleTitle: string,
  question: string,
  correctAnswer: string,
  studentAnswer?: string
): Promise<string> {
  const context = `You are helping a student understand a quiz question in the module "${moduleTitle}".`;
  const prompt = studentAnswer
    ? `Question: "${question}"\nCorrect Answer: "${correctAnswer}"\nStudent's Answer: "${studentAnswer}"\n\nExplain why the correct answer is correct and help the student understand if their answer was wrong.`
    : `Question: "${question}"\nCorrect Answer: "${correctAnswer}"\n\nExplain why this is the correct answer.`;

  const result = await callAIGateway(supabase, {
    prompt,
    context,
    provider: "openai",
  });

  return result.response;
}


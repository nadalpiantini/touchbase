// ============================================================
// TouchBase Academy - AI Service
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";

export type AIProvider = "openai" | "gemini";

// Rate limiting: Max requests per user per hour
const RATE_LIMIT_REQUESTS_PER_HOUR = 50;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// In-memory rate limit tracking (in production, use Redis or database)
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if user has exceeded rate limit
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitCache.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    // Reset or initialize
    rateLimitCache.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_REQUESTS_PER_HOUR) {
    return false; // Rate limit exceeded
  }

  userLimit.count++;
  return true;
}

/**
 * Basic content safety filter (simple keyword check)
 * In production, use a proper content moderation API
 */
function filterUnsafeContent(content: string): boolean {
  const unsafeKeywords = [
    // Add keywords that should be filtered
    // This is a basic implementation - use proper moderation API in production
  ];
  
  const lowerContent = content.toLowerCase();
  return !unsafeKeywords.some(keyword => lowerContent.includes(keyword));
}

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
 * Call AI gateway Edge Function with rate limiting and safety checks
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

  // Rate limiting check
  if (!checkRateLimit(session.user.id)) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  // Basic content safety filter
  if (!filterUnsafeContent(request.prompt)) {
    throw new Error("Content does not meet safety guidelines.");
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

  const result = await response.json();

  // Filter response content for safety
  if (!filterUnsafeContent(result.response)) {
    throw new Error("AI response was filtered for safety reasons.");
  }

  return result;
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


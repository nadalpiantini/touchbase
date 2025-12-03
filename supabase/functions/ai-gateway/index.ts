// ============================================================
// TouchBase Academy - AI Gateway Edge Function
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const RATE_LIMIT_PER_MINUTE = 10;

interface RateLimitStore {
  [userId: string]: {
    count: number;
    resetAt: number;
  };
}

const rateLimitStore: RateLimitStore = {};

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore[userId];

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitStore[userId] = {
      count: 1,
      resetAt: now + 60000, // 1 minute
    };
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_PER_MINUTE) {
    return false;
  }

  userLimit.count++;
  return true;
}

async function moderateContent(text: string): Promise<boolean> {
  // Simple content moderation - check for inappropriate words
  // In production, use a proper moderation API
  const inappropriateWords = [
    "violence",
    "hate",
    "harassment",
    // Add more as needed
  ];

  const lowerText = text.toLowerCase();
  return !inappropriateWords.some((word) => lowerText.includes(word));
}

async function callOpenAI(prompt: string, context?: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const messages = [];
  if (context) {
    messages.push({
      role: "system",
      content: `You are a helpful educational assistant for TouchBase Academy. Context: ${context}`,
    });
  }
  messages.push({
    role: "user",
    content: prompt,
  });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

async function callGemini(prompt: string, context?: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const fullPrompt = context
    ? `Context: ${context}\n\nUser question: ${prompt}`
    : prompt;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || "";
}

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "authorization, content-type",
        },
      });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check rate limit
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { prompt, provider = "openai", context } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Content moderation
    if (!(await moderateContent(prompt))) {
      return new Response(
        JSON.stringify({ error: "Content does not meet safety guidelines" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Call AI provider
    let response: string;
    try {
      if (provider === "gemini") {
        response = await callGemini(prompt, context);
      } else {
        response = await callOpenAI(prompt, context);
      }
    } catch (error: any) {
      console.error("AI API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response", details: error.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Moderate response
    if (!(await moderateContent(response))) {
      return new Response(
        JSON.stringify({ error: "AI response does not meet safety guidelines" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        response,
        provider,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: any) {
    console.error("AI Gateway error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});


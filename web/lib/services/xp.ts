// ============================================================
// TouchBase Academy - XP Service
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";
import { XPAction, XP_VALUES, calculateLevel, SkillCategory } from "@/lib/types/gamification";

export type XPAward = {
  userId: string;
  action: XPAction;
  amount: number;
  skillCategory?: SkillCategory;
  metadata?: Record<string, unknown>;
};

/**
 * Award XP to a user
 */
export async function awardXP(
  supabase: SupabaseClient,
  award: XPAward
): Promise<{ newXp: number; newLevel: number; leveledUp: boolean }> {
  // Get current user profile
  const { data: profile, error: profileError } = await supabase
    .from("touchbase_profiles")
    .select("xp, level")
    .eq("id", award.userId)
    .single();

  if (profileError || !profile) {
    throw new Error("Failed to fetch user profile");
  }

  const currentXp = profile.xp || 0;
  const currentLevel = profile.level || 1;
  const xpAmount = XP_VALUES[award.action];

  // Calculate new XP and level
  const newXp = currentXp + xpAmount;
  const newLevel = calculateLevel(newXp);
  const leveledUp = newLevel > currentLevel;

  // Update profile
  const { error: updateError } = await supabase
    .from("touchbase_profiles")
    .update({
      xp: newXp,
      level: newLevel,
      updated_at: new Date().toISOString(),
    })
    .eq("id", award.userId);

  if (updateError) {
    throw new Error("Failed to update XP");
  }

  // TODO: Store XP history/transactions for analytics
  // TODO: Award skill-specific XP if skillCategory is provided

  return {
    newXp,
    newLevel,
    leveledUp,
  };
}

/**
 * Award XP for module completion
 */
export async function awardModuleCompletionXP(
  supabase: SupabaseClient,
  userId: string,
  moduleId: string,
  score?: number
): Promise<{ newXp: number; newLevel: number; leveledUp: boolean }> {
  // Award base XP for completion
  const result = await awardXP(supabase, {
    userId,
    action: "module_complete",
    amount: XP_VALUES.module_complete,
    metadata: { moduleId },
  });

  // Award bonus XP for perfect score
  if (score === 100) {
    await awardXP(supabase, {
      userId,
      action: "quiz_perfect",
      amount: XP_VALUES.quiz_perfect,
      metadata: { moduleId, score },
    });
  }

  return result;
}

/**
 * Award XP for quiz answer
 */
export async function awardQuizXP(
  supabase: SupabaseClient,
  userId: string,
  isCorrect: boolean,
  isPerfect: boolean = false
): Promise<void> {
  if (isCorrect) {
    await awardXP(supabase, {
      userId,
      action: isPerfect ? "quiz_perfect" : "quiz_correct",
      amount: isPerfect ? XP_VALUES.quiz_perfect : XP_VALUES.quiz_correct,
      metadata: { isPerfect },
    });
  }
}

/**
 * Award XP for step completion
 */
export async function awardStepXP(
  supabase: SupabaseClient,
  userId: string,
  stepType: "content" | "quiz" | "scenario"
): Promise<void> {
  if (stepType === "scenario") {
    await awardXP(supabase, {
      userId,
      action: "scenario_complete",
      amount: XP_VALUES.scenario_complete,
    });
  } else {
    await awardXP(supabase, {
      userId,
      action: "step_complete",
      amount: XP_VALUES.step_complete,
    });
  }
}

/**
 * Get user XP summary
 */
export async function getUserXPSummary(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  totalXp: number;
  level: number;
  xpForNextLevel: number;
  xpProgress: number;
}> {
  const { data: profile, error } = await supabase
    .from("touchbase_profiles")
    .select("xp, level")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    throw new Error("Failed to fetch user profile");
  }

  const totalXp = profile.xp || 0;
  const level = profile.level || 1;

  // Calculate XP for next level
  const { xpProgressToNextLevel } = await import("@/lib/types/gamification");
  const progress = xpProgressToNextLevel(totalXp, level);

  return {
    totalXp,
    level,
    xpForNextLevel: progress.required,
    xpProgress: progress.percentage,
  };
}

// ============================================================
// TouchBase Academy - Streak Service
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";
import { Streak, StreakUpdateResult } from "@/lib/types/streak";

/**
 * Update user streak (call when user completes activity)
 */
export async function updateStreak(
  supabase: SupabaseClient,
  userId: string,
  orgId: string
): Promise<StreakUpdateResult> {
  const { data, error } = await supabase.rpc("touchbase_update_streak", {
    p_user_id: userId,
    p_org_id: orgId,
  });

  if (error) throw error;
  return data[0] as StreakUpdateResult;
}

/**
 * Get user streak
 */
export async function getUserStreak(
  supabase: SupabaseClient,
  userId: string,
  orgId: string
): Promise<Streak | null> {
  const { data, error } = await supabase
    .from("touchbase_streaks")
    .select("*")
    .eq("user_id", userId)
    .eq("org_id", orgId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  return data as Streak;
}

/**
 * Get streak leaderboard for an organization
 */
export async function getStreakLeaderboard(
  supabase: SupabaseClient,
  orgId: string,
  limit: number = 10
): Promise<Array<Streak & { user_name?: string; user_email?: string }>> {
  const { data, error } = await supabase
    .from("touchbase_streaks")
    .select(`
      *,
      user_profile:touchbase_profiles(full_name, email)
    `)
    .eq("org_id", orgId)
    .order("current_streak", { ascending: false })
    .order("longest_streak", { ascending: false })
    .limit(limit);

  if (error) throw error;

  type StreakWithProfile = {
    user_profile: { full_name?: string; email?: string } | null;
  } & Streak;

  return (data || []).map((item: StreakWithProfile) => ({
    ...item,
    user_name: item.user_profile?.full_name,
    user_email: item.user_profile?.email,
  })) as Array<Streak & { user_name?: string; user_email?: string }>;
}


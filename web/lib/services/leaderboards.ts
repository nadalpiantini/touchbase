// ============================================================
// TouchBase Academy - Leaderboard Service
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";

export type LeaderboardEntry = {
  user_id: string;
  user_name?: string;
  user_email?: string;
  total_xp: number;
  level: number;
  current_streak: number;
  modules_completed: number;
  rank: number;
};

export type LeaderboardType = "xp" | "streak" | "modules" | "level";

/**
 * Get XP leaderboard for an organization
 */
export async function getXPLeaderboard(
  supabase: SupabaseClient,
  orgId: string,
  limit: number = 20
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("touchbase_profiles")
    .select(`
      id,
      full_name,
      email,
      xp,
      level,
      streak:touchbase_streaks(current_streak)
    `)
    .eq("default_org_id", orgId)
    .not("xp", "is", null)
    .order("xp", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Get module completion counts
  const userIds = (data || []).map((p) => p.id);
  const { data: progress } = await supabase
    .from("touchbase_progress")
    .select("user_id")
    .eq("org_id", orgId)
    .eq("status", "completed")
    .in("user_id", userIds);

  const completionCounts = new Map<string, number>();
  progress?.forEach((p) => {
    completionCounts.set(p.user_id, (completionCounts.get(p.user_id) || 0) + 1);
  });

  return (data || []).map((profile, index) => ({
    user_id: profile.id,
    user_name: profile.full_name,
    user_email: profile.email,
    total_xp: profile.xp || 0,
    level: profile.level || 1,
    current_streak: (Array.isArray(profile.streak) && profile.streak[0]?.current_streak) || 0,
    modules_completed: completionCounts.get(profile.id) || 0,
    rank: index + 1,
  }));
}

/**
 * Get streak leaderboard for an organization
 */
export async function getStreakLeaderboard(
  supabase: SupabaseClient,
  orgId: string,
  limit: number = 20
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("touchbase_streaks")
    .select(`
      user_id,
      current_streak,
      longest_streak,
      user_profile:touchbase_profiles(id, full_name, email, xp, level)
    `)
    .eq("org_id", orgId)
    .order("current_streak", { ascending: false })
    .order("longest_streak", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Get module completion counts
  const userIds = (data || []).map((s) => s.user_id);
  const { data: progress } = await supabase
    .from("touchbase_progress")
    .select("user_id")
    .eq("org_id", orgId)
    .eq("status", "completed")
    .in("user_id", userIds);

  const completionCounts = new Map<string, number>();
  progress?.forEach((p) => {
    completionCounts.set(p.user_id, (completionCounts.get(p.user_id) || 0) + 1);
  });

  // Supabase returns joined relations as arrays, so we handle both cases
  type ProfileData = { full_name?: string; email?: string; xp?: number; level?: number };
  type StreakWithProfile = {
    user_profile: ProfileData | ProfileData[] | null;
  } & { user_id: string; current_streak: number; longest_streak: number };

  return (data || []).map((streak: StreakWithProfile, index) => {
    const profile = Array.isArray(streak.user_profile) ? streak.user_profile[0] : streak.user_profile;
    return {
      user_id: streak.user_id,
      user_name: profile?.full_name,
      user_email: profile?.email,
      total_xp: profile?.xp || 0,
      level: profile?.level || 1,
      current_streak: streak.current_streak,
      modules_completed: completionCounts.get(streak.user_id) || 0,
      rank: index + 1,
    };
  });
}

/**
 * Get class leaderboard (students in a specific class)
 */
export async function getClassLeaderboard(
  supabase: SupabaseClient,
  classId: string,
  type: LeaderboardType = "xp",
  limit: number = 20
): Promise<LeaderboardEntry[]> {
  // Get enrolled students
  const { data: enrollments } = await supabase
    .from("touchbase_class_enrollments")
    .select("student_id")
    .eq("class_id", classId);

  if (!enrollments || enrollments.length === 0) {
    return [];
  }

  const studentIds = enrollments.map((e) => e.student_id);

  if (type === "xp" || type === "level") {
    const { data: profiles } = await supabase
      .from("touchbase_profiles")
      .select(`
        id,
        full_name,
        email,
        xp,
        level
      `)
      .in("id", studentIds)
      .order(type === "xp" ? "xp" : "level", { ascending: false })
      .limit(limit);

    return (profiles || []).map((profile, index) => ({
      user_id: profile.id,
      user_name: profile.full_name,
      user_email: profile.email,
      total_xp: profile.xp || 0,
      level: profile.level || 1,
      current_streak: 0,
      modules_completed: 0,
      rank: index + 1,
    }));
  }

  // For streak leaderboard
  const { data: streaks } = await supabase
    .from("touchbase_streaks")
    .select(`
      user_id,
      current_streak,
      user_profile:touchbase_profiles(id, full_name, email, xp, level)
    `)
    .in("user_id", studentIds)
    .order("current_streak", { ascending: false })
    .limit(limit);

  return (streaks || []).map((streak, index) => {
    const profile = streak.user_profile as any;
    return {
      user_id: streak.user_id,
      user_name: profile?.full_name,
      user_email: profile?.email,
      total_xp: profile?.xp || 0,
      level: profile?.level || 1,
      current_streak: streak.current_streak,
      modules_completed: 0,
      rank: index + 1,
    };
  });
}


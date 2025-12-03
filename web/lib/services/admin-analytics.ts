// ============================================================
// TouchBase Academy - Admin Analytics Service
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";

export type PlatformMetrics = {
  total_users: number;
  total_organizations: number;
  total_classes: number;
  total_modules: number;
  active_users_30d: number;
  total_progress_records: number;
  completion_rate: number;
};

export type EngagementMetrics = {
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  average_session_duration: number;
  modules_started: number;
  modules_completed: number;
  average_completion_rate: number;
};

export type AdoptionMetrics = {
  new_users_7d: number;
  new_users_30d: number;
  new_organizations_30d: number;
  new_classes_30d: number;
  new_modules_30d: number;
  retention_rate_7d: number;
  retention_rate_30d: number;
};

/**
 * Get platform-wide metrics
 */
export async function getPlatformMetrics(
  supabase: SupabaseClient
): Promise<PlatformMetrics> {
  // Get total counts
  const [
    { count: totalUsers },
    { count: totalOrgs },
    { count: totalClasses },
    { count: totalModules },
    { count: totalProgress },
  ] = await Promise.all([
    supabase.from("touchbase_profiles").select("*", { count: "exact", head: true }),
    supabase.from("touchbase_organizations").select("*", { count: "exact", head: true }),
    supabase.from("touchbase_classes").select("*", { count: "exact", head: true }),
    supabase.from("touchbase_modules").select("*", { count: "exact", head: true }),
    supabase.from("touchbase_progress").select("*", { count: "exact", head: true }),
  ]);

  // Get active users (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { count: activeUsers } = await supabase
    .from("touchbase_progress")
    .select("user_id", { count: "exact", head: true })
    .gte("last_accessed_at", thirtyDaysAgo.toISOString());

  // Get completion rate
  const { count: completedProgress } = await supabase
    .from("touchbase_progress")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  const completionRate =
    (totalProgress || 0) > 0
      ? ((completedProgress || 0) / (totalProgress || 1)) * 100
      : 0;

  return {
    total_users: totalUsers || 0,
    total_organizations: totalOrgs || 0,
    total_classes: totalClasses || 0,
    total_modules: totalModules || 0,
    active_users_30d: activeUsers || 0,
    total_progress_records: totalProgress || 0,
    completion_rate: completionRate,
  };
}

/**
 * Get engagement metrics
 */
export async function getEngagementMetrics(
  supabase: SupabaseClient
): Promise<EngagementMetrics> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    { count: dau },
    { count: wau },
    { count: mau },
  ] = await Promise.all([
    supabase
      .from("touchbase_progress")
      .select("user_id", { count: "exact", head: true })
      .gte("last_accessed_at", oneDayAgo.toISOString()),
    supabase
      .from("touchbase_progress")
      .select("user_id", { count: "exact", head: true })
      .gte("last_accessed_at", oneWeekAgo.toISOString()),
    supabase
      .from("touchbase_progress")
      .select("user_id", { count: "exact", head: true })
      .gte("last_accessed_at", oneMonthAgo.toISOString()),
  ]);

  const { count: modulesStarted } = await supabase
    .from("touchbase_progress")
    .select("*", { count: "exact", head: true })
    .neq("status", "not_started");

  const { count: modulesCompleted } = await supabase
    .from("touchbase_progress")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  const { data: progressData } = await supabase
    .from("touchbase_progress")
    .select("completion_percentage");

  const avgCompletion =
    progressData && progressData.length > 0
      ? progressData.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) /
        progressData.length
      : 0;

  return {
    daily_active_users: dau || 0,
    weekly_active_users: wau || 0,
    monthly_active_users: mau || 0,
    average_session_duration: 0, // Would need separate tracking
    modules_started: modulesStarted || 0,
    modules_completed: modulesCompleted || 0,
    average_completion_rate: avgCompletion,
  };
}

/**
 * Get adoption metrics
 */
export async function getAdoptionMetrics(
  supabase: SupabaseClient
): Promise<AdoptionMetrics> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    { count: newUsers7d },
    { count: newUsers30d },
    { count: newOrgs30d },
    { count: newClasses30d },
    { count: newModules30d },
  ] = await Promise.all([
    supabase
      .from("touchbase_profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString()),
    supabase
      .from("touchbase_profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("touchbase_organizations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("touchbase_classes")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("touchbase_modules")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString()),
  ]);

  // Calculate retention (simplified - users who accessed in last 7/30 days)
  const { count: retained7d } = await supabase
    .from("touchbase_progress")
    .select("user_id", { count: "exact", head: true })
    .gte("last_accessed_at", sevenDaysAgo.toISOString());

  const { count: retained30d } = await supabase
    .from("touchbase_progress")
    .select("user_id", { count: "exact", head: true })
    .gte("last_accessed_at", thirtyDaysAgo.toISOString());

  const { count: totalUsers } = await supabase
    .from("touchbase_profiles")
    .select("*", { count: "exact", head: true });

  const retention7d = (totalUsers || 0) > 0 ? ((retained7d || 0) / (totalUsers || 1)) * 100 : 0;
  const retention30d = (totalUsers || 0) > 0 ? ((retained30d || 0) / (totalUsers || 1)) * 100 : 0;

  return {
    new_users_7d: newUsers7d || 0,
    new_users_30d: newUsers30d || 0,
    new_organizations_30d: newOrgs30d || 0,
    new_classes_30d: newClasses30d || 0,
    new_modules_30d: newModules30d || 0,
    retention_rate_7d: retention7d,
    retention_rate_30d: retention30d,
  };
}


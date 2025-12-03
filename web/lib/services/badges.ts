// ============================================================
// TouchBase Academy - Badge Service
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";
import { Badge, UserBadge, BadgeCriteria } from "@/lib/types/badge";

/**
 * Get all active badges for an organization
 */
export async function getBadges(
  supabase: SupabaseClient,
  orgId?: string
): Promise<Badge[]> {
  let query = supabase
    .from("touchbase_badges")
    .select("*")
    .eq("is_active", true);

  if (orgId) {
    query = query.or(`org_id.is.null,org_id.eq.${orgId}`);
  } else {
    query = query.is("org_id", null);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Badge[];
}

/**
 * Get user's badges
 */
export async function getUserBadges(
  supabase: SupabaseClient,
  userId: string,
  orgId: string
): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from("touchbase_user_badges")
    .select(`
      *,
      badge:touchbase_badges (*)
    `)
    .eq("user_id", userId)
    .eq("org_id", orgId)
    .order("awarded_at", { ascending: false });

  if (error) throw error;
  return (data || []) as UserBadge[];
}

/**
 * Award badge to user
 */
export async function awardBadge(
  supabase: SupabaseClient,
  userId: string,
  badgeId: string,
  orgId: string,
  metadata?: Record<string, unknown>
): Promise<UserBadge> {
  const { data, error } = await supabase.rpc("touchbase_award_badge", {
    p_user_id: userId,
    p_badge_id: badgeId,
    p_org_id: orgId,
    p_metadata: metadata || null,
  });

  if (error) throw error;
  return data as UserBadge;
}

/**
 * Check if user qualifies for a badge based on criteria
 */
export async function checkBadgeEligibility(
  supabase: SupabaseClient,
  userId: string,
  orgId: string,
  badge: Badge
): Promise<boolean> {
  const criteria = badge.criteria;

  // Check if user already has this badge
  const { data: existing } = await supabase
    .from("touchbase_user_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("badge_id", badge.id)
    .eq("org_id", orgId)
    .single();

  if (existing) {
    return false; // Already has badge
  }

  // Check criteria based on type
  switch (criteria.type) {
    case "module_complete": {
      const { data: progress } = await supabase
        .from("touchbase_progress")
        .select("id")
        .eq("user_id", userId)
        .eq("org_id", orgId)
        .eq("status", "completed");

      const count = progress?.length || 0;
      return count >= (criteria.count || 1);
    }

    case "quiz_perfect": {
      const { data: progress } = await supabase
        .from("touchbase_progress")
        .select("step_progress")
        .eq("user_id", userId)
        .eq("org_id", orgId);

      let perfectCount = 0;
      progress?.forEach((p) => {
        const steps = (p.step_progress as any[]) || [];
        steps.forEach((step) => {
          if (step.type === "quiz" && step.quizScore === 100) {
            perfectCount++;
          }
        });
      });

      return perfectCount >= (criteria.count || 1);
    }

    case "level_reach": {
      const { data: profile } = await supabase
        .from("touchbase_profiles")
        .select("level")
        .eq("id", userId)
        .single();

      const level = profile?.level || 1;
      return level >= (criteria.level || 1);
    }

    default:
      return false;
  }
}

/**
 * Auto-award badges based on user actions
 */
export async function checkAndAwardBadges(
  supabase: SupabaseClient,
  userId: string,
  orgId: string,
  action: "module_complete" | "quiz_perfect" | "level_up"
): Promise<UserBadge[]> {
  const badges = await getBadges(supabase, orgId);
  const awarded: UserBadge[] = [];

  for (const badge of badges) {
    const criteria = badge.criteria;

    // Only check badges relevant to this action
    if (
      (action === "module_complete" && criteria.type === "module_complete") ||
      (action === "quiz_perfect" && criteria.type === "quiz_perfect") ||
      (action === "level_up" && criteria.type === "level_reach")
    ) {
      const eligible = await checkBadgeEligibility(supabase, userId, orgId, badge);
      if (eligible) {
        const award = await awardBadge(supabase, userId, badge.id, orgId, {
          auto_awarded: true,
          action,
        });
        awarded.push(award);
      }
    }
  }

  return awarded;
}


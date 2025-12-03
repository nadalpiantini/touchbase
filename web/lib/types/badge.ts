// ============================================================
// TouchBase Academy - Badge Types
// ============================================================

export type BadgeCategory = "achievement" | "milestone" | "skill" | "streak" | "special";

export type BadgeCriteria = {
  type: "module_complete" | "quiz_perfect" | "daily_streak" | "level_reach" | "skill_master" | "assignment_ontime";
  count?: number;
  module_id?: string;
  skill?: string;
  level?: number;
};

export type Badge = {
  id: string;
  org_id?: string;
  name: string;
  description?: string;
  icon_url?: string;
  category: BadgeCategory;
  criteria: BadgeCriteria;
  xp_reward: number;
  created_at: string;
  is_active: boolean;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  org_id: string;
  awarded_at: string;
  metadata?: Record<string, unknown>;
  badge?: Badge; // Joined badge data
};


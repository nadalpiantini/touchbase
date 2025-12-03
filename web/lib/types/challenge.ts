// ============================================================
// TouchBase Academy - Challenge Types
// ============================================================

export type ChallengeType = "module_complete" | "xp_earn" | "streak_maintain" | "skill_master";

export type Challenge = {
  id: string;
  org_id: string;
  class_id?: string;
  teacher_id: string;
  title: string;
  description?: string;
  challenge_type: ChallengeType;
  target_value: number;
  reward_xp: number;
  reward_badge_id?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ChallengeParticipant = {
  challenge_id: string;
  user_id: string;
  org_id: string;
  current_progress: number;
  completed: boolean;
  completed_at?: string;
  joined_at: string;
  challenge?: Challenge; // Joined challenge data
  user_profile?: {
    id: string;
    full_name?: string;
    email?: string;
  };
};


// ============================================================
// TouchBase Academy - Streak Types
// ============================================================

export type Streak = {
  user_id: string;
  org_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  streak_start_date: string;
  updated_at: string;
};

export type StreakUpdateResult = {
  current_streak: number;
  longest_streak: number;
  is_new_streak: boolean;
  streak_broken: boolean;
};


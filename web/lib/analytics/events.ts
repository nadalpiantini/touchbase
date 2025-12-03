// ============================================================
// TouchBase Academy - Analytics Events
// ============================================================

/**
 * Event names for PostHog analytics
 */
export const AnalyticsEvents = {
  // Authentication
  USER_SIGNED_UP: "user_signed_up",
  USER_LOGGED_IN: "user_logged_in",
  USER_LOGGED_OUT: "user_logged_out",

  // Class Management
  CLASS_CREATED: "class_created",
  CLASS_JOINED: "class_joined",
  CLASS_VIEWED: "class_viewed",

  // Module Management
  MODULE_CREATED: "module_created",
  MODULE_STARTED: "module_started",
  MODULE_COMPLETED: "module_completed",
  MODULE_STEP_COMPLETED: "module_step_completed",

  // Progress
  PROGRESS_UPDATED: "progress_updated",
  QUIZ_ANSWERED: "quiz_answered",
  SCENARIO_CHOICE_MADE: "scenario_choice_made",

  // Gamification
  XP_EARNED: "xp_earned",
  LEVEL_UP: "level_up",
  BADGE_EARNED: "badge_earned",
  STREAK_UPDATED: "streak_updated",

  // Challenges
  CHALLENGE_CREATED: "challenge_created",
  CHALLENGE_JOINED: "challenge_joined",
  CHALLENGE_COMPLETED: "challenge_completed",

  // AI
  AI_COACH_USED: "ai_coach_used",
  AI_HINT_REQUESTED: "ai_hint_requested",
  AI_EXPLANATION_REQUESTED: "ai_explanation_requested",

  // Attendance
  ATTENDANCE_MARKED: "attendance_marked",
  ATTENDANCE_VIEWED: "attendance_viewed",

  // Schedule
  SCHEDULE_CREATED: "schedule_created",
  SCHEDULE_VIEWED: "schedule_viewed",
} as const;

export type AnalyticsEventName = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];

/**
 * Event properties interface
 */
export interface AnalyticsEventProperties {
  // User context
  user_id?: string;
  org_id?: string;
  role?: string;

  // Class context
  class_id?: string;
  class_name?: string;

  // Module context
  module_id?: string;
  module_title?: string;
  step_type?: string;
  step_index?: number;

  // Progress context
  completion_percentage?: number;
  score?: number;
  time_spent_seconds?: number;

  // Gamification context
  xp_amount?: number;
  level?: number;
  badge_id?: string;
  badge_name?: string;
  streak_days?: number;

  // Challenge context
  challenge_id?: string;
  challenge_type?: string;
  challenge_progress?: number;

  // AI context
  ai_provider?: string;
  ai_prompt_length?: number;

  // Attendance context
  attendance_status?: string;
  attendance_date?: string;

  // Schedule context
  schedule_day?: number;
  schedule_time?: string;

  // Error context
  error_message?: string;
  error_code?: string;

  // Custom properties
  [key: string]: string | number | boolean | undefined;
}

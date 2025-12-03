// ============================================================
// TouchBase Academy - Analytics Event Types
// ============================================================

export type AnalyticsEvent =
  | { name: "module_started"; properties: { moduleId: string; userId: string } }
  | { name: "module_completed"; properties: { moduleId: string; userId: string; score: number } }
  | { name: "quiz_answered"; properties: { quizId: string; correct: boolean; userId: string } }
  | { name: "badge_earned"; properties: { badgeId: string; userId: string } }
  | { name: "xp_gained"; properties: { amount: number; userId: string; source: string } }
  | { name: "level_up"; properties: { newLevel: number; userId: string } }
  | { name: "class_created"; properties: { classId: string; teacherId: string } }
  | { name: "student_invited"; properties: { classId: string; studentId: string } }
  | { name: "assignment_created"; properties: { assignmentId: string; moduleId: string; classId: string } }
  | { name: "coach_message_sent"; properties: { userId: string; messageLength: number } }
  | { name: "class_joined"; properties: { classId: string; studentId: string; code: string } }
  | { name: "progress_updated"; properties: { moduleId: string; userId: string; completionPercentage: number } }
  | { name: "assignment_completed"; properties: { assignmentId: string; studentId: string; moduleId: string } };

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  try {
    const { posthog } = require("./posthog");
    if (posthog && posthog.__loaded) {
      posthog.capture(event.name, event.properties);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to track event:", event.name, error);
    }
  }
}

// Helper function to identify user
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") return;

  try {
    const { posthog } = require("./posthog");
    if (posthog && posthog.__loaded) {
      posthog.identify(userId, properties);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to identify user:", error);
    }
  }
}

// Helper function to reset user (on logout)
export function resetUser() {
  if (typeof window === "undefined") return;

  try {
    const { posthog } = require("./posthog");
    if (posthog && posthog.__loaded) {
      posthog.reset();
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to reset user:", error);
    }
  }
}


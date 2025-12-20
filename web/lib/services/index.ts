// ============================================================
// TouchBase Academy - Services Export
// ============================================================

// Analytics
export * from "./analytics";
export * from "./admin-analytics";

// Education
export * from "./classes";
export * from "./class-modules";
export * from "./modules";
export * from "./progress";
export * from "./quiz";

// Gamification
export * from "./badges";
export * from "./challenges";
export * from "./leaderboards";
// Note: streaks.ts has duplicate getStreakLeaderboard - export selectively
export { getUserStreak, updateStreak } from "./streaks";
export * from "./xp";

// Scheduling
export * from "./attendance";
export * from "./calendar";
export * from "./schedules";

// Assignments
export * from "./assignments";

// AI
export * from "./ai";

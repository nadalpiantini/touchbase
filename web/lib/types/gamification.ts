// ============================================================
// TouchBase Academy - Gamification Types
// ============================================================

export type SkillCategory = "Communication" | "Self-Management" | "Decision-Making" | "Collaboration" | "Other";

export type UserSkills = {
  [skill in SkillCategory]: {
    xp: number;
    level: number;
  };
};

export type XPAction = 
  | "module_complete" 
  | "quiz_correct" 
  | "quiz_perfect" 
  | "daily_streak" 
  | "assignment_ontime"
  | "scenario_complete"
  | "step_complete";

export const XP_VALUES: Record<XPAction, number> = {
  module_complete: 100,
  quiz_correct: 10,
  quiz_perfect: 50,
  daily_streak: 20,
  assignment_ontime: 50,
  scenario_complete: 25,
  step_complete: 5,
};

export type LevelThreshold = {
  level: number;
  xpRequired: number;
};

// XP required per level (exponential growth)
export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 100 },
  { level: 3, xpRequired: 250 },
  { level: 4, xpRequired: 500 },
  { level: 5, xpRequired: 1000 },
  { level: 6, xpRequired: 2000 },
  { level: 7, xpRequired: 3500 },
  { level: 8, xpRequired: 5500 },
  { level: 9, xpRequired: 8000 },
  { level: 10, xpRequired: 12000 },
];

/**
 * Calculate level from total XP
 */
export function calculateLevel(totalXp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xpRequired) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
}

/**
 * Calculate XP needed for next level
 */
export function xpForNextLevel(currentLevel: number): number {
  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === currentLevel + 1);
  if (!nextThreshold) {
    return 0; // Max level
  }
  return nextThreshold.xpRequired;
}

/**
 * Calculate XP progress to next level
 */
export function xpProgressToNextLevel(currentXp: number, currentLevel: number): {
  current: number;
  required: number;
  percentage: number;
} {
  const currentThreshold = LEVEL_THRESHOLDS.find((t) => t.level === currentLevel);
  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === currentLevel + 1);

  if (!currentThreshold || !nextThreshold) {
    return { current: 0, required: 0, percentage: 100 };
  }

  const current = currentXp - currentThreshold.xpRequired;
  const required = nextThreshold.xpRequired - currentThreshold.xpRequired;
  const percentage = Math.min(100, Math.max(0, (current / required) * 100));

  return { current, required, percentage };
}

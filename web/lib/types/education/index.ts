// ============================================================
// TouchBase Academy - Education Types
// ============================================================

export type ClassScheduleEntry = {
  dayOfWeek: number; // 0-6 (Sunday = 0)
  startTime: string; // "09:00"
  endTime: string; // "10:00"
};

export type ClassSchedule = {
  timezone: string;
  entries: ClassScheduleEntry[];
};

export type Class = {
  id: string;
  org_id: string;
  teacher_id: string;
  name: string;
  code: string;
  grade_level?: string;
  description?: string;
  schedule?: ClassSchedule;
  created_at: string;
  updated_at: string;
};

export type ClassEnrollment = {
  id: string;
  class_id: string;
  student_id: string;
  enrolled_at: string;
};

export type ModuleDifficulty = "beginner" | "intermediate" | "advanced";

export type Module = {
  id: string;
  title: string;
  description?: string;
  skills: string[];
  difficulty: ModuleDifficulty;
  duration_minutes: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

export type StepType = "content" | "quiz" | "scenario";

export type ContentStepData = {
  text?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "audio";
};

export type QuizStepData = {
  question: string;
  options: string[];
  correctIndex: number;
};

export type ScenarioStepData = {
  prompt: string;
  options: Array<{
    text: string;
    consequence: string;
  }>;
};

export type ModuleStep = {
  id: string;
  module_id: string;
  order_index: number;
  step_type: StepType;
  content_data: ContentStepData | QuizStepData | ScenarioStepData;
  created_at: string;
  updated_at: string;
};

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type StepProgress = {
  stepId: string;
  type: StepType;
  completed: boolean;
  quizScore?: number;
  scenarioChoice?: number;
  timeSpentSeconds: number;
};

export type ModuleProgress = {
  id: string;
  user_id: string;
  module_id: string;
  status: ProgressStatus;
  completion_percentage: number;
  total_time_seconds: number;
  score?: number;
  step_progress: StepProgress[];
  started_at?: string;
  last_accessed_at: string;
  completed_at?: string;
};

export type Assignment = {
  id: string;
  class_id: string;
  module_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  due_date: string;
  assigned_at: string;
  created_at: string;
};


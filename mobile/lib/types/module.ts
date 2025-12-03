// Module types matching web app
export type ModuleDifficulty = "beginner" | "intermediate" | "advanced";

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
  step_progress: StepProgress[];
  created_at: string;
  updated_at: string;
};


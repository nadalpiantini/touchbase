// Re-export types from web app (shared types)
// For now, we'll define basic types here
// In the future, these can be moved to a shared package

export type UserRole = 'teacher' | 'student' | 'admin' | 'owner' | 'coach' | 'player' | 'parent' | 'viewer';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: UserRole;
  organization_id?: string;
}

export interface Class {
  id: string;
  name: string;
  description?: string;
  code: string;
  teacher_id: string;
  organization_id: string;
  grade_level?: string;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  skills: string[];
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completion_percentage: number;
  total_time_seconds: number;
  step_progress: any[];
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  class_id: string;
  module_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}


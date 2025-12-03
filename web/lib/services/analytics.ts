// ============================================================
// TouchBase Academy - Analytics Service
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";

export type ClassAnalytics = {
  classId: string;
  className: string;
  totalStudents: number;
  enrolledStudents: number;
  completionRate: number;
  averageScore: number;
  modulesAssigned: number;
  modulesCompleted: number;
};

export type ModuleAnalytics = {
  moduleId: string;
  moduleTitle: string;
  totalAssignments: number;
  totalCompletions: number;
  completionRate: number;
  averageScore: number;
  averageTimeMinutes: number;
};

export type StudentProgressSummary = {
  studentId: string;
  studentName: string;
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  averageScore: number;
  totalXp: number;
};

/**
 * Get analytics for a teacher's classes
 */
export async function getTeacherClassAnalytics(
  supabase: SupabaseClient,
  teacherId: string,
  orgId: string
): Promise<ClassAnalytics[]> {
  // Get all classes for this teacher
  const { data: classes, error: classesError } = await supabase
    .from("touchbase_classes")
    .select("id, name")
    .eq("teacher_id", teacherId)
    .eq("org_id", orgId);

  if (classesError || !classes) {
    throw classesError || new Error("Failed to fetch classes");
  }

  // Get analytics for each class
  const analytics = await Promise.all(
    classes.map(async (cls) => {
      // Get enrollments
      const { data: enrollments } = await supabase
        .from("touchbase_class_enrollments")
        .select("student_id")
        .eq("class_id", cls.id);

      const enrolledStudents = enrollments?.length || 0;

      // Get assignments for this class
      const { data: assignments } = await supabase
        .from("touchbase_assignments")
        .select("id, module_id")
        .eq("class_id", cls.id);

      const modulesAssigned = assignments?.length || 0;

      // Get submissions
      const { data: submissions } = await supabase
        .from("touchbase_assignment_submissions")
        .select("score, completed_at")
        .in(
          "assignment_id",
          assignments?.map((a) => a.id) || []
        );

      const modulesCompleted = submissions?.filter((s) => s.completed_at).length || 0;
      const completionRate =
        enrolledStudents > 0 ? (modulesCompleted / (enrolledStudents * modulesAssigned)) * 100 : 0;

      const scores = submissions?.filter((s) => s.score !== null).map((s) => s.score || 0) || [];
      const averageScore =
        scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;

      return {
        classId: cls.id,
        className: cls.name,
        totalStudents: enrolledStudents,
        enrolledStudents,
        completionRate: Math.round(completionRate),
        averageScore: Math.round(averageScore),
        modulesAssigned,
        modulesCompleted,
      };
    })
  );

  return analytics;
}

/**
 * Get analytics for modules assigned by a teacher
 */
export async function getTeacherModuleAnalytics(
  supabase: SupabaseClient,
  teacherId: string,
  orgId: string
): Promise<ModuleAnalytics[]> {
  // Get all assignments by this teacher
  const { data: assignments, error: assignmentsError } = await supabase
    .from("touchbase_assignments")
    .select("id, module_id, class_id")
    .eq("teacher_id", teacherId)
    .eq("org_id", orgId);

  if (assignmentsError || !assignments) {
    throw assignmentsError || new Error("Failed to fetch assignments");
  }

  // Group by module
  const moduleMap = new Map<string, string[]>();
  assignments.forEach((a) => {
    if (!moduleMap.has(a.module_id)) {
      moduleMap.set(a.module_id, []);
    }
    moduleMap.get(a.module_id)!.push(a.id);
  });

  // Get module titles
  const moduleIds = Array.from(moduleMap.keys());
  const { data: modules } = await supabase
    .from("touchbase_modules")
    .select("id, title")
    .in("id", moduleIds);

  const moduleTitles = new Map(modules?.map((m) => [m.id, m.title]) || []);

  // Get analytics for each module
  const analytics = await Promise.all(
    Array.from(moduleMap.entries()).map(async ([moduleId, assignmentIds]) => {
      // Get submissions
      const { data: submissions } = await supabase
        .from("touchbase_assignment_submissions")
        .select("score, completed_at")
        .in("assignment_id", assignmentIds);

      const totalCompletions = submissions?.filter((s) => s.completed_at).length || 0;
      const totalAssignments = assignmentIds.length;

      // Get progress data for time tracking
      const { data: progress } = await supabase
        .from("touchbase_progress")
        .select("total_time_seconds, score")
        .eq("module_id", moduleId)
        .eq("org_id", orgId);

      const completedProgress = progress?.filter((p) => p.total_time_seconds > 0) || [];
      const averageTimeMinutes =
        completedProgress.length > 0
          ? Math.round(
              completedProgress.reduce((sum, p) => sum + (p.total_time_seconds || 0), 0) /
                completedProgress.length /
                60
            )
          : 0;

      const scores = submissions?.filter((s) => s.score !== null).map((s) => s.score || 0) || [];
      const averageScore =
        scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;

      return {
        moduleId,
        moduleTitle: moduleTitles.get(moduleId) || "Unknown",
        totalAssignments,
        totalCompletions,
        completionRate: totalAssignments > 0 ? Math.round((totalCompletions / totalAssignments) * 100) : 0,
        averageScore: Math.round(averageScore),
        averageTimeMinutes,
      };
    })
  );

  return analytics;
}

/**
 * Get student progress summary for a class
 */
export async function getClassStudentProgress(
  supabase: SupabaseClient,
  classId: string
): Promise<StudentProgressSummary[]> {
  // Get enrollments
  const { data: enrollments } = await supabase
    .from("touchbase_class_enrollments")
    .select("student_id")
    .eq("class_id", classId);

  if (!enrollments || enrollments.length === 0) {
    return [];
  }

  // Get student profiles separately
  const studentIds = enrollments.map((e) => e.student_id);
  const { data: profiles } = await supabase
    .from("touchbase_profiles")
    .select("id, full_name, email, xp")
    .in("id", studentIds);

  const profileMap = new Map(
    (profiles || []).map((p) => [p.id, { id: p.id, full_name: p.full_name, email: p.email, xp: p.xp }])
  );

  // Get assignments for this class
  const { data: assignments } = await supabase
    .from("touchbase_assignments")
    .select("module_id")
    .eq("class_id", classId);

  const moduleIds = assignments?.map((a) => a.module_id) || [];

  // Get progress for each student
  const summaries = await Promise.all(
    enrollments.map(async (enrollment) => {
      const studentId = enrollment.student_id;
      const studentProfile = profileMap.get(studentId) || null;

      // Get progress for this student
      const { data: progress } = await supabase
        .from("touchbase_progress")
        .select("status, score")
        .eq("user_id", studentId)
        .in("module_id", moduleIds);

      const totalModules = moduleIds.length;
      const completedModules = progress?.filter((p) => p.status === "completed").length || 0;
      const inProgressModules = progress?.filter((p) => p.status === "in_progress").length || 0;

      const scores = progress?.filter((p) => p.score !== null).map((p) => p.score || 0) || [];
      const averageScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;

      return {
        studentId,
        studentName: studentProfile?.full_name || studentProfile?.email || "Unknown",
        totalModules,
        completedModules,
        inProgressModules,
        averageScore: Math.round(averageScore),
        totalXp: studentProfile?.xp || 0,
      };
    })
  );

  return summaries;
}


/**
 * Dev Mode Helper Utilities
 * Provides consistent mock data and utilities for development without auth
 */

// Consistent UUIDs for dev mode - must match seed data
export const DEV_USER_ID = "00000000-0000-0000-0000-000000000002"; // Owner
export const DEV_TEACHER_ID = "00000000-0000-0000-0000-000000000003";
export const DEV_STUDENT_ID = "00000000-0000-0000-0000-000000000004";
export const DEV_ORG_ID = "00000000-0000-0000-0000-000000000001";
export const DEV_CLASS_ID = "00000000-0000-0000-0000-000000000010";
export const DEV_MODULE_ID = "00000000-0000-0000-0000-000000000020";

export const DEV_USER = {
  id: DEV_USER_ID,
  email: "dev@touchbase.local",
};

export const DEV_TEACHER = {
  id: DEV_TEACHER_ID,
  email: "teacher@touchbase.local",
};

export const DEV_STUDENT = {
  id: DEV_STUDENT_ID,
  email: "student@touchbase.local",
};

export const DEV_ORG = {
  id: DEV_ORG_ID,
  name: "Dev Organization",
  slug: "dev-org",
};

export const DEV_MEMBERSHIP = {
  org_id: DEV_ORG_ID,
  user_id: DEV_USER_ID,
  role: "owner" as const,
};

// All test users for easy reference
export const DEV_TEST_USERS = {
  owner: { id: DEV_USER_ID, email: "dev@touchbase.local", role: "owner" },
  teacher: { id: DEV_TEACHER_ID, email: "teacher@touchbase.local", role: "teacher" },
  student: { id: DEV_STUDENT_ID, email: "student@touchbase.local", role: "student" },
} as const;

export function isDevMode(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Get effective user for API routes - returns dev mock if no auth in dev mode
 */
export function getDevUser(authenticatedUser: { id: string; email?: string } | null) {
  if (authenticatedUser) return authenticatedUser;
  if (isDevMode()) return DEV_USER;
  return null;
}

/**
 * Get effective org_id for API routes - returns dev org if no auth in dev mode
 */
export function getDevOrgId(orgIdFromDb: string | null | undefined): string | null {
  if (orgIdFromDb) return orgIdFromDb;
  if (isDevMode()) return DEV_ORG_ID;
  return null;
}

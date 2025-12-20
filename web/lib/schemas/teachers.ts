/**
 * Zod validation schemas for teachers API
 * @module lib/schemas/teachers
 */

import { z } from "zod";

/**
 * Schema for creating a new teacher
 */
export const createTeacherSchema = z.object({
  // Required fields
  full_name: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .trim(),

  // Optional personal info
  photo_url: z.string().url("Invalid photo URL").optional(),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional(),
  email: z.string()
    .email("Invalid email format")
    .optional(),
  birthdate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (use YYYY-MM-DD)")
    .optional(),
  nationality: z.string().max(50).optional(),
  address: z.string().max(200).optional(),

  // Employment info
  employment_type: z.enum(['full-time', 'part-time', 'contractor', 'volunteer'])
    .optional(),
  hire_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (use YYYY-MM-DD)")
    .optional(),
  salary: z.number()
    .positive("Salary must be positive")
    .max(1000000, "Salary exceeds maximum")
    .optional(),
  department: z.string().max(100).optional(),

  // Education
  degree: z.string().max(100).optional(),
  field_of_study: z.string().max(100).optional(),
  institution: z.string().max(200).optional(),
  graduation_year: z.number()
    .int("Graduation year must be an integer")
    .min(1950, "Graduation year too old")
    .max(new Date().getFullYear() + 10, "Graduation year too far in future")
    .optional(),

  // Professional info
  teaching_subjects: z.array(z.string()).max(20, "Too many subjects").optional(),
  experience_years: z.number()
    .int("Experience must be whole years")
    .min(0, "Experience cannot be negative")
    .max(60, "Experience years exceeds maximum")
    .optional(),
  certifications: z.array(z.string()).max(50, "Too many certifications").optional(),
  licenses: z.array(z.string()).max(20, "Too many licenses").optional(),

  // Notes
  notes: z.string().max(2000, "Notes exceed maximum length").optional(),
});

/**
 * Schema for updating a teacher
 */
export const updateTeacherSchema = createTeacherSchema.partial();

/**
 * Inferred TypeScript type from schema
 */
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;

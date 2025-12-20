/**
 * Teacher Validation Schemas
 * Zod schemas for teacher form validation
 * @module lib/schemas/teacher
 */

import { z } from "zod";

/**
 * Teacher status enum
 */
export const teacherStatusSchema = z.enum([
  "active",
  "inactive",
  "on_leave",
  "terminated",
]);

/**
 * Email validation regex
 */
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;

/**
 * Phone validation regex (flexible international format)
 */
const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

/**
 * Base teacher schema with all fields
 */
export const teacherSchema = z.object({
  // Personal Information (required)
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be less than 100 characters")
    .trim(),

  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be less than 100 characters")
    .trim(),

  email: z
    .string()
    .min(1, "Email is required")
    .regex(emailRegex, "Invalid email format")
    .toLowerCase()
    .trim(),

  // Personal Information (optional)
  phone: z
    .string()
    .regex(phoneRegex, "Invalid phone format")
    .optional()
    .nullable()
    .or(z.literal("")),

  date_of_birth: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),

  profile_photo_url: z
    .string()
    .url("Invalid URL format")
    .optional()
    .nullable()
    .or(z.literal("")),

  // Professional Information
  certifications: z
    .array(z.string())
    .default([]),

  specializations: z
    .array(z.string())
    .default([]),

  years_experience: z
    .number()
    .int("Years of experience must be a whole number")
    .min(0, "Years of experience cannot be negative")
    .max(99, "Years of experience must be less than 100")
    .default(0),

  bio: z
    .string()
    .max(1000, "Bio must be less than 1000 characters")
    .optional()
    .nullable()
    .or(z.literal("")),

  department: z
    .string()
    .max(100, "Department must be less than 100 characters")
    .optional()
    .nullable()
    .or(z.literal("")),

  position: z
    .string()
    .max(100, "Position must be less than 100 characters")
    .optional()
    .nullable()
    .or(z.literal("")),

  // Employment Details
  hire_date: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),

  status: teacherStatusSchema.default("active"),

  employment_type: z
    .string()
    .max(50, "Employment type must be less than 50 characters")
    .optional()
    .nullable()
    .or(z.literal("")),

  // Contact & Emergency
  address: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional()
    .nullable()
    .or(z.literal("")),

  emergency_contact_name: z
    .string()
    .max(200, "Emergency contact name must be less than 200 characters")
    .optional()
    .nullable()
    .or(z.literal("")),

  emergency_contact_phone: z
    .string()
    .regex(phoneRegex, "Invalid phone format")
    .optional()
    .nullable()
    .or(z.literal("")),

  emergency_contact_relationship: z
    .string()
    .max(100, "Relationship must be less than 100 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
});

/**
 * Schema for creating a new teacher (required fields only)
 */
export const createTeacherSchema = teacherSchema.pick({
  first_name: true,
  last_name: true,
  email: true,
}).extend({
  phone: teacherSchema.shape.phone,
  date_of_birth: teacherSchema.shape.date_of_birth,
  profile_photo_url: teacherSchema.shape.profile_photo_url,
  certifications: teacherSchema.shape.certifications,
  specializations: teacherSchema.shape.specializations,
  years_experience: teacherSchema.shape.years_experience,
  bio: teacherSchema.shape.bio,
  department: teacherSchema.shape.department,
  position: teacherSchema.shape.position,
  hire_date: teacherSchema.shape.hire_date,
  status: teacherSchema.shape.status,
  employment_type: teacherSchema.shape.employment_type,
  address: teacherSchema.shape.address,
  emergency_contact_name: teacherSchema.shape.emergency_contact_name,
  emergency_contact_phone: teacherSchema.shape.emergency_contact_phone,
  emergency_contact_relationship: teacherSchema.shape.emergency_contact_relationship,
});

/**
 * Schema for updating a teacher (all fields optional except ID)
 */
export const updateTeacherSchema = teacherSchema.partial();

/**
 * Type inference from schemas
 */
export type TeacherFormData = z.infer<typeof teacherSchema>;
export type CreateTeacherFormData = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherFormData = z.infer<typeof updateTeacherSchema>;

/**
 * Default values for teacher form
 */
export const teacherFormDefaults: TeacherFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  profile_photo_url: "",
  certifications: [],
  specializations: [],
  years_experience: 0,
  bio: "",
  department: "",
  position: "",
  hire_date: "",
  status: "active",
  employment_type: "",
  address: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relationship: "",
};

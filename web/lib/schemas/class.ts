/**
 * Class Validation Schemas
 * Zod schemas for class form validation
 * @module lib/schemas/class
 */

import { z } from "zod";

/**
 * Class status enum
 */
export const classStatusSchema = z.enum([
  "active",
  "inactive",
  "completed",
  "cancelled",
]);

/**
 * Date validation helper
 * Validates ISO date string format (YYYY-MM-DD)
 */
const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (use YYYY-MM-DD)")
  .optional()
  .nullable()
  .or(z.literal(""));

/**
 * Base class schema with all fields
 */
export const classSchema = z.object({
  // Basic Information (required)
  name: z
    .string()
    .min(1, "Class name is required")
    .max(200, "Class name must be less than 200 characters")
    .trim(),

  max_students: z
    .number()
    .int("Maximum students must be a whole number")
    .min(1, "Maximum students must be at least 1")
    .max(500, "Maximum students must be less than 500"),

  // Basic Information (optional)
  code: z
    .string()
    .max(50, "Class code must be less than 50 characters")
    .optional()
    .nullable()
    .or(z.literal("")),

  level: z
    .string()
    .max(100, "Level must be less than 100 characters")
    .optional()
    .nullable()
    .or(z.literal("")),

  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable()
    .or(z.literal("")),

  status: classStatusSchema.default("active"),

  // Schedule Information
  start_date: dateStringSchema,

  end_date: dateStringSchema,

  schedule_description: z
    .string()
    .max(500, "Schedule description must be less than 500 characters")
    .optional()
    .nullable()
    .or(z.literal("")),

  // Location Information
  location: z
    .string()
    .max(200, "Location must be less than 200 characters")
    .optional()
    .nullable()
    .or(z.literal("")),

  room: z
    .string()
    .max(100, "Room must be less than 100 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
}).refine(
  (data) => {
    // Validate that end_date is after start_date if both are provided
    if (data.start_date && data.end_date && data.start_date !== "" && data.end_date !== "") {
      return new Date(data.end_date) >= new Date(data.start_date);
    }
    return true;
  },
  {
    message: "End date must be on or after start date",
    path: ["end_date"],
  }
);

/**
 * Schema for creating a new class (required fields only)
 */
export const createClassSchema = classSchema.pick({
  name: true,
  max_students: true,
}).extend({
  code: classSchema.shape.code,
  level: classSchema.shape.level,
  description: classSchema.shape.description,
  status: classSchema.shape.status,
  start_date: classSchema.shape.start_date,
  end_date: classSchema.shape.end_date,
  schedule_description: classSchema.shape.schedule_description,
  location: classSchema.shape.location,
  room: classSchema.shape.room,
});

/**
 * Schema for updating a class (all fields optional except validation rules)
 */
export const updateClassSchema = classSchema.partial().refine(
  (data) => {
    // Validate that end_date is after start_date if both are provided
    if (data.start_date && data.end_date && data.start_date !== "" && data.end_date !== "") {
      return new Date(data.end_date) >= new Date(data.start_date);
    }
    return true;
  },
  {
    message: "End date must be on or after start date",
    path: ["end_date"],
  }
);

/**
 * Type inference from schemas
 */
export type ClassFormData = z.infer<typeof classSchema>;
export type CreateClassFormData = z.infer<typeof createClassSchema>;
export type UpdateClassFormData = z.infer<typeof updateClassSchema>;

/**
 * Default values for class form
 */
export const classFormDefaults: ClassFormData = {
  name: "",
  code: "",
  level: "",
  description: "",
  max_students: 20, // reasonable default
  start_date: "",
  end_date: "",
  schedule_description: "",
  status: "active",
  location: "",
  room: "",
};

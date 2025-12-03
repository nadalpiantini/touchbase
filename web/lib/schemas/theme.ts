/**
 * Zod validation schemas for theme system
 *
 * @module lib/schemas/theme
 */

import { z } from 'zod';

/**
 * Validates hex color format (#RRGGBB)
 */
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

/**
 * Theme validation schema
 * Ensures all theme properties meet requirements before saving to database
 */
export const themeSchema = z.object({
  primaryColor: z
    .string()
    .regex(hexColorRegex, 'Primary color must be valid hex format (#RRGGBB)'),

  secondaryColor: z
    .string()
    .regex(hexColorRegex, 'Secondary color must be valid hex format (#RRGGBB)'),

  accentColor: z
    .string()
    .regex(hexColorRegex, 'Accent color must be valid hex format (#RRGGBB)'),

  logoUrl: z
    .string()
    .url('Logo URL must be a valid URL')
    .or(z.string().startsWith('/', 'Logo URL must be a valid path')),

  faviconUrl: z
    .string()
    .url('Favicon URL must be a valid URL')
    .or(z.string().startsWith('/', 'Favicon URL must be a valid path'))
    .optional(),

  fontFamily: z
    .string()
    .min(1, 'Font family name is required')
    .max(100, 'Font family name too long'),

  customDomain: z
    .string()
    .regex(
      /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i,
      'Custom domain must be valid (e.g., academy.touchbase.app)'
    )
    .optional(),
});

/**
 * Type inference from schema
 */
export type ThemeInput = z.infer<typeof themeSchema>;

/**
 * Partial theme schema for updates
 * Allows updating individual theme properties
 */
export const themeUpdateSchema = themeSchema.partial();

/**
 * Validates contrast ratio between two colors
 * Ensures WCAG AA compliance (4.5:1 for normal text)
 *
 * @param color1 - First color in hex format
 * @param color2 - Second color in hex format
 * @returns Contrast ratio
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  // Convert hex to RGB
  const hex2rgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : null;
  };

  // Calculate relative luminance
  const luminance = (rgb: { r: number; g: number; b: number } | null) => {
    if (!rgb) return 0;
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = luminance(hex2rgb(color1));
  const lum2 = luminance(hex2rgb(color2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Validates theme accessibility
 * Checks contrast ratios meet WCAG AA standards
 *
 * @param theme - Theme to validate
 * @returns Validation result with warnings
 */
export function validateThemeAccessibility(theme: ThemeInput): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check primary color against white background
  const primaryOnWhite = calculateContrastRatio(theme.primaryColor, '#FFFFFF');
  if (primaryOnWhite < 4.5) {
    warnings.push(
      `Primary color contrast ratio (${primaryOnWhite.toFixed(2)}:1) is below WCAG AA standard (4.5:1)`
    );
  }

  // Check secondary color against white background
  const secondaryOnWhite = calculateContrastRatio(theme.secondaryColor, '#FFFFFF');
  if (secondaryOnWhite < 4.5) {
    warnings.push(
      `Secondary color contrast ratio (${secondaryOnWhite.toFixed(2)}:1) is below WCAG AA standard (4.5:1)`
    );
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

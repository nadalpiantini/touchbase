'use client';

/**
 * useTheme Hook
 *
 * Access current theme context and theme manipulation functions
 *
 * @module lib/hooks/useTheme
 */

import { useContext } from 'react';
import { ThemeContext, ThemeContextValue } from '@/components/providers/ThemeProvider';

/**
 * Hook to access theme context
 *
 * @returns Theme context with current theme and setter functions
 * @throws Error if used outside ThemeProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, setTheme } = useTheme();
 *
 *   return (
 *     <div style={{ color: theme.primaryColor }}>
 *       Themed content
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

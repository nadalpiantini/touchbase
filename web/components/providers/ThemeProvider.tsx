'use client';

/**
 * ThemeProvider - Whitelabel Theme System
 *
 * Provides tenant-specific theming via CSS variables injection
 * Supports light/dark modes and custom brand colors
 *
 * @module components/providers/ThemeProvider
 */

import { createContext, useEffect, ReactNode } from 'react';
import { Theme, defaultTheme } from '@/types/theme';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resetTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  /** Child components */
  children: ReactNode;
  /** Initial theme (defaults to TouchBase theme) */
  theme?: Theme;
  /** Optional custom theme setter for dynamic updates */
  onThemeChange?: (theme: Theme) => void;
}

/**
 * Injects CSS variables into document root
 * @param theme - Theme object with color and typography values
 */
function injectThemeVariables(theme: Theme): void {
  const root = document.documentElement;

  // Inject color variables
  root.style.setProperty('--color-primary', theme.primaryColor);
  root.style.setProperty('--color-secondary', theme.secondaryColor);
  root.style.setProperty('--color-accent', theme.accentColor);

  // Inject typography variable
  root.style.setProperty('--font-family-brand', theme.fontFamily);

  // Update favicon if provided
  if (theme.faviconUrl) {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = theme.faviconUrl;
    }
  }
}

/**
 * ThemeProvider Component
 *
 * Wraps application and provides theme context with CSS variable injection
 *
 * @example
 * ```tsx
 * <ThemeProvider theme={tenantTheme}>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  theme = defaultTheme,
  onThemeChange,
}: ThemeProviderProps) {

  // Inject CSS variables on mount and theme change
  useEffect(() => {
    injectThemeVariables(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    injectThemeVariables(newTheme);
    onThemeChange?.(newTheme);
  };

  const resetTheme = () => {
    injectThemeVariables(defaultTheme);
    onThemeChange?.(defaultTheme);
  };

  const contextValue: ThemeContextValue = {
    theme,
    setTheme,
    resetTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

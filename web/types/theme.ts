/**
 * Theme types for whitelabel branding system
 *
 * @module types/theme
 */

export interface Theme {
  /** Primary brand color (hex format) */
  primaryColor: string;

  /** Secondary brand color (hex format) */
  secondaryColor: string;

  /** Accent color for highlights (hex format) */
  accentColor: string;

  /** Logo URL (public URL or path) */
  logoUrl: string;

  /** Favicon URL (optional) */
  faviconUrl?: string;

  /** Brand font family name */
  fontFamily: string;

  /** Custom domain for tenant (optional) */
  customDomain?: string;
}

/**
 * Default TouchBase theme
 * Used as fallback when no tenant theme is loaded
 */
export const defaultTheme: Theme = {
  primaryColor: '#B21E2A',      // TouchBase Red
  secondaryColor: '#14213D',     // TouchBase Navy
  accentColor: '#C82E3C',        // TouchBase Stitch
  logoUrl: '/touchbase-logo.png',
  fontFamily: 'Oswald',
};

/**
 * Theme application metadata
 */
export interface ThemeMetadata {
  /** Tenant ID this theme belongs to */
  tenantId: string;

  /** Theme name/label */
  name: string;

  /** Last updated timestamp */
  updatedAt: Date;

  /** Created timestamp */
  createdAt: Date;
}

/**
 * Full theme object with metadata
 */
export interface ThemeWithMetadata extends Theme {
  metadata: ThemeMetadata;
}

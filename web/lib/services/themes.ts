// ============================================================
// TouchBase Academy - Tenant Themes Service
// Whitelabel branding system for multi-tenant organizations
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";
import { Theme } from "@/types/theme";

export interface TenantTheme {
  id: number;
  org_id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  logo_url: string | null;
  favicon_url: string | null;
  custom_domain: string | null;
  dark_mode_enabled: boolean;
  dark_primary_color: string | null;
  dark_secondary_color: string | null;
  dark_accent_color: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

/**
 * Get theme for an organization
 */
export async function getOrgTheme(
  supabase: SupabaseClient,
  orgId: string
): Promise<TenantTheme | null> {
  const { data, error } = await supabase
    .from("touchbase_tenant_themes")
    .select("*")
    .eq("org_id", orgId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  return data as TenantTheme;
}

/**
 * Get theme by custom domain
 */
export async function getThemeByDomain(
  supabase: SupabaseClient,
  domain: string
): Promise<TenantTheme | null> {
  const { data, error } = await supabase
    .from("touchbase_tenant_themes")
    .select("*")
    .eq("custom_domain", domain)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  return data as TenantTheme;
}

/**
 * Create theme for an organization
 */
export async function createOrgTheme(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  themeData: {
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    font_family?: string;
    logo_url?: string | null;
    favicon_url?: string | null;
    custom_domain?: string | null;
    dark_mode_enabled?: boolean;
    dark_primary_color?: string | null;
    dark_secondary_color?: string | null;
    dark_accent_color?: string | null;
  }
): Promise<TenantTheme> {
  const { data, error } = await supabase
    .from("touchbase_tenant_themes")
    .insert({
      org_id: orgId,
      created_by: userId,
      updated_by: userId,
      ...themeData,
    })
    .select()
    .single();

  if (error) throw error;
  return data as TenantTheme;
}

/**
 * Update theme for an organization
 */
export async function updateOrgTheme(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  themeData: {
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    font_family?: string;
    logo_url?: string | null;
    favicon_url?: string | null;
    custom_domain?: string | null;
    dark_mode_enabled?: boolean;
    dark_primary_color?: string | null;
    dark_secondary_color?: string | null;
    dark_accent_color?: string | null;
  }
): Promise<TenantTheme> {
  const { data, error } = await supabase
    .from("touchbase_tenant_themes")
    .update({
      ...themeData,
      updated_by: userId,
    })
    .eq("org_id", orgId)
    .select()
    .single();

  if (error) throw error;
  return data as TenantTheme;
}

/**
 * Delete theme for an organization (revert to defaults)
 */
export async function deleteOrgTheme(
  supabase: SupabaseClient,
  orgId: string
): Promise<void> {
  const { error } = await supabase
    .from("touchbase_tenant_themes")
    .delete()
    .eq("org_id", orgId);

  if (error) throw error;
}

/**
 * Convert TenantTheme to Theme (for ThemeProvider)
 */
export function tenantThemeToTheme(tenantTheme: TenantTheme): Theme {
  return {
    primaryColor: tenantTheme.primary_color,
    secondaryColor: tenantTheme.secondary_color,
    accentColor: tenantTheme.accent_color,
    logoUrl: tenantTheme.logo_url || '/touchbase-logo.png', // Default logo if none set
    fontFamily: tenantTheme.font_family,
    faviconUrl: tenantTheme.favicon_url || undefined,
  };
}

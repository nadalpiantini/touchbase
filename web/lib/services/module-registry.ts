/**
 * Module Registry Service
 * Handles module availability and enablement per tenant
 * @module lib/services/module-registry
 */

import { SupabaseClient } from "@supabase/supabase-js";

export type ModuleKey =
  | "teachers"
  | "classes"
  | "attendance"
  | "schedules"
  | "analytics"
  | "gamification"
  | "ai_coaching"
  | "reports"
  | "notifications"
  | "integrations";

export interface Module {
  id: number;
  module_key: ModuleKey;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  is_core: boolean;
  is_available: boolean;
  requires_modules: ModuleKey[];
  created_at: string;
  updated_at: string;
}

export interface TenantModule {
  id: number;
  org_id: string;
  module_key: ModuleKey;
  is_enabled: boolean;
  enabled_by: string | null;
  enabled_at: string;
  disabled_at: string | null;
  settings: Record<string, unknown>;
}

export interface EnabledModule {
  module_key: ModuleKey;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  settings: Record<string, unknown>;
}

/**
 * Get all available modules from catalog
 */
export async function getAllModules(
  supabase: SupabaseClient
): Promise<Module[]> {
  const { data, error } = await supabase
    .from("touchbase_modules")
    .select("*")
    .eq("is_available", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching modules:", error);
    throw error;
  }

  return (data || []) as Module[];
}

/**
 * Get specific module by key
 */
export async function getModule(
  supabase: SupabaseClient,
  moduleKey: ModuleKey
): Promise<Module | null> {
  const { data, error } = await supabase
    .from("touchbase_modules")
    .select("*")
    .eq("module_key", moduleKey)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching module:", error);
    throw error;
  }

  return data as Module;
}

/**
 * Check if module is enabled for current user's organization
 */
export async function isModuleEnabled(
  supabase: SupabaseClient,
  moduleKey: ModuleKey
): Promise<boolean> {
  const { data, error } = await supabase.rpc("touchbase_is_module_enabled", {
    p_module_key: moduleKey,
  });

  if (error) {
    console.error("Error checking module status:", error);
    return false;
  }

  return data === true;
}

/**
 * Get all enabled modules for current user's organization
 */
export async function getEnabledModules(
  supabase: SupabaseClient
): Promise<EnabledModule[]> {
  const { data, error } = await supabase.rpc("touchbase_get_enabled_modules");

  if (error) {
    console.error("Error fetching enabled modules:", error);
    throw error;
  }

  return (data || []) as EnabledModule[];
}

/**
 * Get all tenant module configurations for an organization
 */
export async function getTenantModules(
  supabase: SupabaseClient,
  orgId: string
): Promise<TenantModule[]> {
  const { data, error } = await supabase
    .from("touchbase_tenant_modules")
    .select("*")
    .eq("org_id", orgId)
    .order("module_key", { ascending: true });

  if (error) {
    console.error("Error fetching tenant modules:", error);
    throw error;
  }

  return (data || []) as TenantModule[];
}

/**
 * Get specific tenant module configuration
 */
export async function getTenantModule(
  supabase: SupabaseClient,
  orgId: string,
  moduleKey: ModuleKey
): Promise<TenantModule | null> {
  const { data, error } = await supabase
    .from("touchbase_tenant_modules")
    .select("*")
    .eq("org_id", orgId)
    .eq("module_key", moduleKey)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching tenant module:", error);
    throw error;
  }

  return data as TenantModule;
}

/**
 * Enable a module for an organization
 */
export async function enableModule(
  supabase: SupabaseClient,
  orgId: string,
  moduleKey: ModuleKey,
  settings: Record<string, unknown> = {}
): Promise<boolean> {
  const { data, error } = await supabase.rpc("touchbase_enable_module", {
    p_org_id: orgId,
    p_module_key: moduleKey,
    p_settings: settings,
  });

  if (error) {
    console.error("Error enabling module:", error);
    throw error;
  }

  return data === true;
}

/**
 * Disable a module for an organization
 */
export async function disableModule(
  supabase: SupabaseClient,
  orgId: string,
  moduleKey: ModuleKey
): Promise<boolean> {
  const { data, error } = await supabase.rpc("touchbase_disable_module", {
    p_org_id: orgId,
    p_module_key: moduleKey,
  });

  if (error) {
    console.error("Error disabling module:", error);
    throw error;
  }

  return data === true;
}

/**
 * Update module settings for a tenant
 */
export async function updateModuleSettings(
  supabase: SupabaseClient,
  orgId: string,
  moduleKey: ModuleKey,
  settings: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from("touchbase_tenant_modules")
    .update({ settings })
    .eq("org_id", orgId)
    .eq("module_key", moduleKey);

  if (error) {
    console.error("Error updating module settings:", error);
    throw error;
  }
}

/**
 * Get modules grouped by category
 */
export async function getModulesByCategory(
  supabase: SupabaseClient
): Promise<Record<string, Module[]>> {
  const modules = await getAllModules(supabase);

  return modules.reduce(
    (acc, module) => {
      const category = module.category || "other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(module);
      return acc;
    },
    {} as Record<string, Module[]>
  );
}

/**
 * Check if all required modules are enabled
 */
export async function checkRequiredModules(
  supabase: SupabaseClient,
  moduleKey: ModuleKey
): Promise<{ satisfied: boolean; missing: ModuleKey[] }> {
  // Get the module definition
  const moduleDefinition = await getModule(supabase, moduleKey);

  if (!moduleDefinition || !moduleDefinition.requires_modules || moduleDefinition.requires_modules.length === 0) {
    return { satisfied: true, missing: [] };
  }

  // Check each required module
  const missing: ModuleKey[] = [];
  for (const requiredModule of moduleDefinition.requires_modules) {
    const isEnabled = await isModuleEnabled(supabase, requiredModule);
    if (!isEnabled) {
      missing.push(requiredModule);
    }
  }

  return {
    satisfied: missing.length === 0,
    missing,
  };
}

/**
 * Get module enablement status for organization
 * Returns map of module_key -> is_enabled
 */
export async function getModuleStatusMap(
  supabase: SupabaseClient,
  orgId: string
): Promise<Record<ModuleKey, boolean>> {
  const tenantModules = await getTenantModules(supabase, orgId);

  return tenantModules.reduce(
    (acc, tm) => {
      acc[tm.module_key] = tm.is_enabled;
      return acc;
    },
    {} as Record<ModuleKey, boolean>
  );
}

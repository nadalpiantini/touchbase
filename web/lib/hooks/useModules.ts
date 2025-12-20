/**
 * useModules Hook
 * React hook for checking module availability and enablement
 * @module lib/hooks/useModules
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  ModuleKey,
  EnabledModule,
  getEnabledModules,
  isModuleEnabled as checkModuleEnabled,
} from "@/lib/services/module-registry";

export interface ModulesState {
  modules: EnabledModule[];
  loading: boolean;
  error: Error | null;
}

export interface ModulesAPI {
  /** List of enabled modules for current organization */
  modules: EnabledModule[];
  /** Whether modules are loading */
  loading: boolean;
  /** Error if any */
  error: Error | null;
  /** Check if specific module is enabled */
  isEnabled: (moduleKey: ModuleKey) => boolean;
  /** Refresh modules from server */
  refresh: () => Promise<void>;
  /** Get module by key */
  getModule: (moduleKey: ModuleKey) => EnabledModule | undefined;
  /** Check if any of the modules are enabled */
  hasAnyModule: (moduleKeys: ModuleKey[]) => boolean;
  /** Check if all of the modules are enabled */
  hasAllModules: (moduleKeys: ModuleKey[]) => boolean;
}

/**
 * Hook to manage enabled modules for current organization
 */
export function useModules(): ModulesAPI {
  const [state, setState] = useState<ModulesState>({
    modules: [],
    loading: true,
    error: null,
  });

  const loadModules = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const supabase = supabaseBrowser();
      const modules = await getEnabledModules(supabase);

      setState({
        modules,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        modules: [],
        loading: false,
        error: error as Error,
      });
    }
  }, []);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const isEnabled = useCallback(
    (moduleKey: ModuleKey): boolean => {
      return state.modules.some((m) => m.module_key === moduleKey);
    },
    [state.modules]
  );

  const getModule = useCallback(
    (moduleKey: ModuleKey): EnabledModule | undefined => {
      return state.modules.find((m) => m.module_key === moduleKey);
    },
    [state.modules]
  );

  const hasAnyModule = useCallback(
    (moduleKeys: ModuleKey[]): boolean => {
      return moduleKeys.some((key) => isEnabled(key));
    },
    [isEnabled]
  );

  const hasAllModules = useCallback(
    (moduleKeys: ModuleKey[]): boolean => {
      return moduleKeys.every((key) => isEnabled(key));
    },
    [isEnabled]
  );

  return {
    modules: state.modules,
    loading: state.loading,
    error: state.error,
    isEnabled,
    refresh: loadModules,
    getModule,
    hasAnyModule,
    hasAllModules,
  };
}

/**
 * Hook to check single module enablement status
 * More efficient than useModules when you only need one module check
 */
export function useModuleCheck(moduleKey: ModuleKey): {
  isEnabled: boolean;
  loading: boolean;
  error: Error | null;
} {
  const [state, setState] = useState({
    isEnabled: false,
    loading: true,
    error: null as Error | null,
  });

  useEffect(() => {
    let mounted = true;

    async function checkModule() {
      try {
        const supabase = supabaseBrowser();
        const enabled = await checkModuleEnabled(supabase, moduleKey);

        if (mounted) {
          setState({
            isEnabled: enabled,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (mounted) {
          setState({
            isEnabled: false,
            loading: false,
            error: error as Error,
          });
        }
      }
    }

    checkModule();

    return () => {
      mounted = false;
    };
  }, [moduleKey]);

  return state;
}

/**
 * Hook to check multiple module enablement statuses
 * Returns map of module_key -> is_enabled
 */
export function useModuleChecks(moduleKeys: ModuleKey[]): {
  statuses: Record<ModuleKey, boolean>;
  loading: boolean;
  error: Error | null;
} {
  const [state, setState] = useState({
    statuses: {} as Record<ModuleKey, boolean>,
    loading: true,
    error: null as Error | null,
  });

  useEffect(() => {
    let mounted = true;

    async function checkModules() {
      try {
        const supabase = supabaseBrowser();
        const statuses: Record<ModuleKey, boolean> = {} as Record<
          ModuleKey,
          boolean
        >;

        // Check all modules in parallel
        await Promise.all(
          moduleKeys.map(async (key) => {
            const enabled = await checkModuleEnabled(supabase, key);
            statuses[key] = enabled;
          })
        );

        if (mounted) {
          setState({
            statuses,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (mounted) {
          setState({
            statuses: {} as Record<ModuleKey, boolean>,
            loading: false,
            error: error as Error,
          });
        }
      }
    }

    checkModules();

    return () => {
      mounted = false;
    };
  }, [moduleKeys]);

  return state;
}

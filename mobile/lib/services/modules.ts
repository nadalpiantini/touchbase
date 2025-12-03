import { supabase } from '../supabase/client';
import { Module, ModuleStep } from '../types/module';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export async function getModule(moduleId: string): Promise<{ module: Module; steps: ModuleStep[] } | null> {
  try {
    // Try to fetch from API first (for online mode)
    const response = await fetch(`${API_BASE_URL}/api/modules/${moduleId}`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log('API fetch failed, trying direct Supabase query:', error);
  }

  // Fallback to direct Supabase query
  try {
    const { data: module, error: moduleError } = await supabase
      .from('touchbase_modules')
      .select('*')
      .eq('id', moduleId)
      .single();

    if (moduleError) throw moduleError;

    const { data: steps, error: stepsError } = await supabase
      .from('touchbase_module_steps')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: true });

    if (stepsError) throw stepsError;

    return {
      module: module as Module,
      steps: (steps || []) as ModuleStep[],
    };
  } catch (error) {
    console.error('Error fetching module:', error);
    return null;
  }
}

export async function startModuleProgress(moduleId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/api/progress/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ moduleId }),
    });

    if (!response.ok) {
      throw new Error('Failed to start progress');
    }
  } catch (error) {
    console.error('Error starting module progress:', error);
    throw error;
  }
}

export async function updateStepProgress(
  moduleId: string,
  stepIndex: number,
  stepData: any
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/progress/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        moduleId,
        stepIndex,
        stepData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update progress');
    }
  } catch (error) {
    console.error('Error updating step progress:', error);
    throw error;
  }
}


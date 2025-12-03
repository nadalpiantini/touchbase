import * as FileSystem from 'expo-file-system';
import { Module, ModuleStep } from '../types/module';

const OFFLINE_DIR = `${FileSystem.documentDirectory}offline_modules/`;

// Ensure offline directory exists
export async function ensureOfflineDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(OFFLINE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(OFFLINE_DIR, { intermediates: true });
  }
}

// Save module for offline access
export async function saveModuleOffline(module: Module, steps: ModuleStep[]): Promise<void> {
  await ensureOfflineDir();
  const filePath = `${OFFLINE_DIR}module_${module.id}.json`;
  await FileSystem.writeAsStringAsync(
    filePath,
    JSON.stringify({ module, steps, savedAt: new Date().toISOString() })
  );
}

// Load module from offline storage
export async function loadModuleOffline(moduleId: string): Promise<{ module: Module; steps: ModuleStep[] } | null> {
  try {
    const filePath = `${OFFLINE_DIR}module_${moduleId}.json`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    
    if (!fileInfo.exists) {
      return null;
    }

    const content = await FileSystem.readAsStringAsync(filePath);
    const data = JSON.parse(content);
    return { module: data.module, steps: data.steps };
  } catch (error) {
    console.error('Error loading offline module:', error);
    return null;
  }
}

// Check if module is available offline
export async function isModuleOffline(moduleId: string): Promise<boolean> {
  const filePath = `${OFFLINE_DIR}module_${moduleId}.json`;
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  return fileInfo.exists;
}

// Delete offline module
export async function deleteOfflineModule(moduleId: string): Promise<void> {
  const filePath = `${OFFLINE_DIR}module_${moduleId}.json`;
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  if (fileInfo.exists) {
    await FileSystem.deleteAsync(filePath);
  }
}

// List all offline modules
export async function listOfflineModules(): Promise<string[]> {
  await ensureOfflineDir();
  const files = await FileSystem.readDirectoryAsync(OFFLINE_DIR);
  return files
    .filter(file => file.startsWith('module_') && file.endsWith('.json'))
    .map(file => file.replace('module_', '').replace('.json', ''));
}


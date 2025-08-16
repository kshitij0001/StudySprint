import { create } from 'zustand';
import { db } from '@/lib/db';
import type { Settings } from '@/types';

interface SettingsState extends Settings {
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
  resetAllData: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  targetDateISO: '2026-05-03T09:00:00+05:30',
  theme: 'light',
  compact: false,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const settings = await db.getSettings();
      set({ ...settings });
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    const currentSettings = get();
    const newSettings = {
      targetDateISO: currentSettings.targetDateISO,
      theme: currentSettings.theme,
      compact: currentSettings.compact,
      ...updates
    };

    await db.setSettings(newSettings);
    set(newSettings);
  },

  exportData: async () => {
    return await db.exportData();
  },

  importData: async (jsonData) => {
    await db.importData(jsonData);
    // Reload all stores after import
    const { loadSettings } = get();
    await loadSettings();
  },

  resetAllData: async () => {
    await db.clearAllData();
    // Reset to defaults
    set({
      targetDateISO: '2026-05-03T09:00:00+05:30',
      theme: 'light',
      compact: false
    });
  }
}));

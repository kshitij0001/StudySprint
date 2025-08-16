import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '@/lib/db';

interface AppState {
  isLoading: boolean;
  error: string | null;
  lastSync: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastSync: (sync: string) => void;
  initializeApp: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isLoading: false,
      error: null,
      lastSync: null,

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setLastSync: (sync) => set({ lastSync: sync }),

      initializeApp: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Initialize default syllabus if not exists
          const existingSyllabus = await db.getSyllabus();
          if (existingSyllabus.length === 0) {
            const { NEET_SYLLABUS } = await import('@/data/neet-syllabus');
            await db.setSyllabus(NEET_SYLLABUS);
          }

          set({ lastSync: new Date().toISOString() });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to initialize app' });
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'app-store',
      partialize: (state) => ({ lastSync: state.lastSync })
    }
  )
);

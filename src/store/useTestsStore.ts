import { create } from 'zustand';
import { db } from '@/lib/db';
import type { TestEntry } from '@/types';

interface TestsState {
  tests: TestEntry[];
  isLoading: boolean;
  
  loadTests: () => Promise<void>;
  addTest: (test: Omit<TestEntry, 'id'>) => Promise<void>;
  deleteTest: (testId: string) => Promise<void>;
  updateTest: (testId: string, updates: Partial<TestEntry>) => Promise<void>;
  getRecentTests: (days: number) => TestEntry[];
  getAverageScore: (days: number) => number;
  getSubjectPerformance: () => { subject: string; average: number; count: number }[];
}

export const useTestsStore = create<TestsState>((set, get) => ({
  tests: [],
  isLoading: false,

  loadTests: async () => {
    set({ isLoading: true });
    try {
      const tests = await db.getTestEntries();
      set({ tests: tests.sort((a: TestEntry, b: TestEntry) => new Date(b.date).getTime() - new Date(a.date).getTime()) });
    } catch (error) {
      console.error('Failed to load tests:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addTest: async (test) => {
    const newTest: TestEntry = {
      ...test,
      id: crypto.randomUUID()
    };

    const updatedTests = [newTest, ...get().tests];
    await db.setTestEntries(updatedTests);
    set({ tests: updatedTests });
  },

  deleteTest: async (testId) => {
    const updatedTests = get().tests.filter(t => t.id !== testId);
    await db.setTestEntries(updatedTests);
    set({ tests: updatedTests });
  },

  updateTest: async (testId, updates) => {
    const updatedTests = get().tests.map(t =>
      t.id === testId ? { ...t, ...updates } : t
    );
    await db.setTestEntries(updatedTests);
    set({ tests: updatedTests });
  },

  getRecentTests: (days) => {
    const { tests } = get();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return tests.filter(test => new Date(test.date) >= cutoffDate);
  },

  getAverageScore: (days) => {
    const recentTests = get().getRecentTests(days);
    if (recentTests.length === 0) return 0;
    
    const totalPercentage = recentTests.reduce((sum, test) => 
      sum + (test.scoreOverall / test.maxOverall) * 100, 0
    );
    
    return totalPercentage / recentTests.length;
  },

  getSubjectPerformance: () => {
    const { tests } = get();
    const subjects = ['Physics', 'Chemistry', 'Biology'];
    
    return subjects.map(subject => {
      const subjectTests = tests.filter(test => {
        const scoreField = `score${subject}` as keyof TestEntry;
        return test[scoreField] !== undefined;
      });
      
      if (subjectTests.length === 0) {
        return { subject, average: 0, count: 0 };
      }
      
      const totalScore = subjectTests.reduce((sum, test) => {
        const scoreField = `score${subject}` as keyof TestEntry;
        const score = test[scoreField] as number;
        return sum + (score / (test.maxOverall / 3)) * 100; // Assuming equal weightage
      }, 0);
      
      return {
        subject,
        average: totalScore / subjectTests.length,
        count: subjectTests.length
      };
    });
  }
}));

import { create } from 'zustand';
import { db } from '@/lib/db';
import { generateReviewTasks, sortReviewTasks, isOverdue, isDueToday } from '@/lib/srs';
import type { StudySession, ReviewTask, TopicRef } from '@/types';

interface SrsState {
  studySessions: StudySession[];
  reviewTasks: ReviewTask[];
  isLoading: boolean;
  
  loadData: () => Promise<void>;
  addStudySession: (topicRef: TopicRef, notes?: string) => Promise<void>;
  markReviewComplete: (taskId: string) => Promise<void>;
  snoozeReview: (taskId: string, days: number) => Promise<void>;
  removeReviewTask: (taskId: string) => Promise<void>;
  getTodaysReviews: () => ReviewTask[];
  getOverdueReviews: () => ReviewTask[];
  getUpcomingReviews: (days: number) => ReviewTask[];
}

export const useSrsStore = create<SrsState>((set, get) => ({
  studySessions: [],
  reviewTasks: [],
  isLoading: false,

  loadData: async () => {
    set({ isLoading: true });
    try {
      const [sessions, tasks] = await Promise.all([
        db.getStudySessions(),
        db.getReviewTasks()
      ]);
      set({ studySessions: sessions, reviewTasks: tasks });
    } catch (error) {
      console.error('Failed to load SRS data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addStudySession: async (topicRef, notes) => {
    const session: StudySession = {
      id: crypto.randomUUID(),
      topic: topicRef,
      createdAt: new Date().toISOString(),
      notes
    };

    const newReviewTasks = generateReviewTasks(session);
    
    const { studySessions, reviewTasks } = get();
    const updatedSessions = [...studySessions, session];
    const updatedTasks = [...reviewTasks, ...newReviewTasks];

    await Promise.all([
      db.setStudySessions(updatedSessions),
      db.setReviewTasks(updatedTasks)
    ]);

    set({ 
      studySessions: updatedSessions, 
      reviewTasks: updatedTasks 
    });
  },

  markReviewComplete: async (taskId) => {
    const { reviewTasks } = get();
    const updatedTasks = reviewTasks.map(task =>
      task.id === taskId
        ? { ...task, doneAt: new Date().toISOString() }
        : task
    );

    await db.setReviewTasks(updatedTasks);
    set({ reviewTasks: updatedTasks });
  },

  snoozeReview: async (taskId, days) => {
    const { reviewTasks } = get();
    const updatedTasks = reviewTasks.map(task => {
      if (task.id === taskId) {
        const currentDue = new Date(task.dueAt);
        const newDue = new Date(currentDue.getTime() + days * 24 * 60 * 60 * 1000);
        return { ...task, dueAt: newDue.toISOString() };
      }
      return task;
    });

    await db.setReviewTasks(updatedTasks);
    set({ reviewTasks: updatedTasks });
  },

  removeReviewTask: async (taskId) => {
    const { reviewTasks } = get();
    const updatedTasks = reviewTasks.filter(task => task.id !== taskId);

    await db.setReviewTasks(updatedTasks);
    set({ reviewTasks: updatedTasks });
  },

  getTodaysReviews: () => {
    const { reviewTasks } = get();
    return sortReviewTasks(reviewTasks.filter(task => 
      !task.doneAt && (isDueToday(task) || isOverdue(task))
    ));
  },

  getOverdueReviews: () => {
    const { reviewTasks } = get();
    return reviewTasks.filter(task => !task.doneAt && isOverdue(task));
  },

  getUpcomingReviews: (days) => {
    const { reviewTasks } = get();
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return reviewTasks.filter(task => 
      !task.doneAt && 
      new Date(task.dueAt) > now && 
      new Date(task.dueAt) <= future
    );
  },

  // Test function to create review tasks due today for testing snooze
  addTestReviewTasks: async () => {
    const { studySessions, reviewTasks } = get();
    const today = new Date();
    
    if (studySessions.length === 0) return;
    
    const testTasks = studySessions.slice(0, 3).map(session => ({
      id: crypto.randomUUID(),
      sessionId: session.id,
      dueAt: today.toISOString(),
    }));
    
    const updatedTasks = [...reviewTasks, ...testTasks];
    await db.setReviewTasks(updatedTasks);
    set({ reviewTasks: updatedTasks });
  }
}));

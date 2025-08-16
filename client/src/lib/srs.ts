import { addDays, startOfDay } from 'date-fns';
import { SRS_OFFSETS } from './constants';
import type { ReviewTask, StudySession } from '@/types';

export function generateReviewTasks(session: StudySession): ReviewTask[] {
  const baseDate = new Date(session.createdAt);
  const baseDayStart = startOfDay(baseDate);
  
  return SRS_OFFSETS.map((offset, index) => {
    const dueDate = addDays(baseDayStart, offset);
    
    return {
      id: crypto.randomUUID(),
      sessionId: session.id,
      dueAt: dueDate.toISOString(),
    };
  });
}

export function isOverdue(task: ReviewTask): boolean {
  if (task.doneAt) return false;
  const now = new Date();
  const dueDate = new Date(task.dueAt);
  return now > dueDate;
}

export function getDaysOverdue(task: ReviewTask): number {
  if (!isOverdue(task)) return 0;
  const now = startOfDay(new Date());
  const dueDate = startOfDay(new Date(task.dueAt));
  return Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function isDueToday(task: ReviewTask): boolean {
  if (task.doneAt) return false;
  const now = startOfDay(new Date());
  const dueDate = startOfDay(new Date(task.dueAt));
  return now.getTime() === dueDate.getTime();
}

export function sortReviewTasks(tasks: ReviewTask[]): ReviewTask[] {
  return [...tasks].sort((a, b) => {
    // Completed tasks go to the end
    if (a.doneAt && !b.doneAt) return 1;
    if (!a.doneAt && b.doneAt) return -1;
    
    // Among incomplete tasks: overdue first, then by due date
    const aOverdue = isOverdue(a);
    const bOverdue = isOverdue(b);
    
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    // If both overdue or both not overdue, sort by due date
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });
}

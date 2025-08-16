export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Subject = 'Physics' | 'Chemistry' | 'Biology';

export interface TopicRef {
  id: string;
  subject: Subject;
  chapterId: string;
  topicId: string;
  difficulty: Difficulty;
}

export interface StudySession {
  id: string;
  topic: TopicRef;
  createdAt: string; // ISO
  notes?: string;
}

export interface ReviewTask {
  id: string;
  sessionId: string; // links to StudySession
  dueAt: string;     // ISO
  doneAt?: string;   // ISO when completed
  snoozedDays?: number; // 0–3
}

export interface PdfFile {
  id: string;
  subject: Subject;
  folder: string;
  name: string;
  size: number;
  tags: string[];
  blobId?: string;
  url?: string;
  addedAt: string;
}

export interface TestEntry {
  id: string;
  date: string;
  source?: string;
  durationMin?: number;
  scoreOverall: number;
  maxOverall: number;
  scorePhysics?: number;
  scoreChemistry?: number;
  scoreBiology?: number;
  byTopic?: Array<{
    subject: Subject;
    chapterId: string;
    topicId: string;
    difficulty: Difficulty;
    correct: number;
    total: number;
  }>;
}

export interface Settings {
  targetDateISO: string;
  theme: 'light' | 'dark';
  compact: boolean;
}

export interface Chapter {
  id: string;
  name: string;
  difficulty: Difficulty;
  topics: Array<{
    id: string;
    name: string;
    difficulty: Difficulty;
  }>;
}

export interface Syllabus {
  subject: Subject;
  chapters: Chapter[];
}

export interface AppState {
  studySessions: StudySession[];
  reviewTasks: ReviewTask[];
  pdfFiles: PdfFile[];
  testEntries: TestEntry[];
  settings: Settings;
  syllabus: Syllabus[];
}

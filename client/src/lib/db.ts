import { get, set, del, clear, keys } from 'idb-keyval';
import type { AppState } from '@/types';

const DB_KEYS = {
  STUDY_SESSIONS: 'studySessions',
  REVIEW_TASKS: 'reviewTasks',
  PDF_FILES: 'pdfFiles',
  TEST_ENTRIES: 'testEntries',
  SETTINGS: 'settings',
  SYLLABUS: 'syllabus'
} as const;

export class DatabaseService {
  async getStudySessions() {
    return await get(DB_KEYS.STUDY_SESSIONS) || [];
  }

  async setStudySessions(sessions: any[]) {
    await set(DB_KEYS.STUDY_SESSIONS, sessions);
  }

  async getReviewTasks() {
    return await get(DB_KEYS.REVIEW_TASKS) || [];
  }

  async setReviewTasks(tasks: any[]) {
    await set(DB_KEYS.REVIEW_TASKS, tasks);
  }

  async getPdfFiles() {
    return await get(DB_KEYS.PDF_FILES) || [];
  }

  async setPdfFiles(files: any[]) {
    await set(DB_KEYS.PDF_FILES, files);
  }

  async getTestEntries() {
    return await get(DB_KEYS.TEST_ENTRIES) || [];
  }

  async setTestEntries(entries: any[]) {
    await set(DB_KEYS.TEST_ENTRIES, entries);
  }

  async getSettings() {
    return await get(DB_KEYS.SETTINGS) || {
      targetDateISO: '2026-05-03T09:00:00+05:30',
      theme: 'light',
      compact: false
    };
  }

  async setSettings(settings: any) {
    await set(DB_KEYS.SETTINGS, settings);
  }

  async getSyllabus() {
    return await get(DB_KEYS.SYLLABUS) || [];
  }

  async setSyllabus(syllabus: any[]) {
    await set(DB_KEYS.SYLLABUS, syllabus);
  }

  async exportData(): Promise<string> {
    const data: Partial<AppState> = {
      studySessions: await this.getStudySessions(),
      reviewTasks: await this.getReviewTasks(),
      pdfFiles: await this.getPdfFiles(),
      testEntries: await this.getTestEntries(),
      settings: await this.getSettings(),
      syllabus: await this.getSyllabus()
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData) as Partial<AppState>;
      
      if (data.studySessions) await this.setStudySessions(data.studySessions);
      if (data.reviewTasks) await this.setReviewTasks(data.reviewTasks);
      if (data.pdfFiles) await this.setPdfFiles(data.pdfFiles);
      if (data.testEntries) await this.setTestEntries(data.testEntries);
      if (data.settings) await this.setSettings(data.settings);
      if (data.syllabus) await this.setSyllabus(data.syllabus);
    } catch (error) {
      throw new Error('Invalid JSON data');
    }
  }

  async clearAllData(): Promise<void> {
    await clear();
  }
}

export const db = new DatabaseService();

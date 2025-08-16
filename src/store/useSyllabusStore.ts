import { create } from 'zustand';
import { db } from '@/lib/db';
import type { Syllabus, Subject, Difficulty } from '@/types';

interface SyllabusState {
  syllabus: Syllabus[];
  isLoading: boolean;
  searchTerm: string;
  selectedSubject: Subject | 'all';
  selectedDifficulty: Difficulty | 'all';
  
  loadSyllabus: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedSubject: (subject: Subject | 'all') => void;
  setSelectedDifficulty: (difficulty: Difficulty | 'all') => void;
  getFilteredSyllabus: () => Syllabus[];
}

export const useSyllabusStore = create<SyllabusState>((set, get) => ({
  syllabus: [],
  isLoading: false,
  searchTerm: '',
  selectedSubject: 'all',
  selectedDifficulty: 'all',

  loadSyllabus: async () => {
    set({ isLoading: true });
    try {
      const syllabus = await db.getSyllabus();
      set({ syllabus });
    } catch (error) {
      console.error('Failed to load syllabus:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedSubject: (subject) => set({ selectedSubject: subject }),
  setSelectedDifficulty: (difficulty) => set({ selectedDifficulty: difficulty }),

  getFilteredSyllabus: () => {
    const { syllabus, searchTerm, selectedSubject, selectedDifficulty } = get();
    
    return syllabus
      .filter(s => selectedSubject === 'all' || s.subject === selectedSubject)
      .map(subject => ({
        ...subject,
        chapters: subject.chapters
          .filter(chapter => 
            (selectedDifficulty === 'all' || chapter.difficulty === selectedDifficulty) &&
            (searchTerm === '' || 
             chapter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             chapter.topics.some(topic => 
               topic.name.toLowerCase().includes(searchTerm.toLowerCase())
             ))
          )
          .map(chapter => ({
            ...chapter,
            topics: chapter.topics.filter(topic =>
              (selectedDifficulty === 'all' || topic.difficulty === selectedDifficulty) &&
              (searchTerm === '' || topic.name.toLowerCase().includes(searchTerm.toLowerCase()))
            )
          }))
      }))
      .filter(subject => subject.chapters.length > 0);
  }
}));

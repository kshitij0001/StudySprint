import { create } from 'zustand';
import { db } from '@/lib/db';
import type { Syllabus, Subject, Difficulty, Topic } from '@/types';

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
  addTopic: (chapterId: string, name: string, difficulty: Difficulty) => string;
  addChapter: (subjectName: Subject, name: string, difficulty: Difficulty) => string;
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
  },

  addTopic: (chapterId: string, name: string, difficulty: Difficulty) => {
    const newTopicId = `topic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    set((state) => {
      const updatedSyllabus = state.syllabus.map(subject => ({
        ...subject,
        chapters: subject.chapters.map(chapter => {
          if (chapter.id === chapterId) {
            const newTopic: Topic = {
              id: newTopicId,
              name,
              difficulty,
              status: 'not-started'
            };
            return {
              ...chapter,
              topics: [...chapter.topics, newTopic]
            };
          }
          return chapter;
        })
      }));

      return { syllabus: updatedSyllabus };
    });

    return newTopicId;
  },

  addChapter: (subjectName: Subject, name: string, difficulty: Difficulty) => {
    const newChapterId = `chapter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    set((state) => {
      const updatedSyllabus = state.syllabus.map(subject => {
        if (subject.subject === subjectName) {
          const newChapter = {
            id: newChapterId,
            name,
            difficulty,
            status: 'not-started' as const,
            topics: []
          };
          return {
            ...subject,
            chapters: [...subject.chapters, newChapter]
          };
        }
        return subject;
      });

      return { syllabus: updatedSyllabus };
    });

    return newChapterId;
  },
}));
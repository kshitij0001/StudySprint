import { create } from 'zustand';
import { db } from '@/lib/db';
import type { PdfFile, Subject } from '@/types';

interface FilesState {
  files: PdfFile[];
  isLoading: boolean;
  selectedSubject: Subject | 'all';
  searchTerm: string;
  selectedTags: string[];
  
  loadFiles: () => Promise<void>;
  addFile: (file: File, subject: Subject, tags: string[]) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  updateFileTags: (fileId: string, tags: string[]) => Promise<void>;
  setSelectedSubject: (subject: Subject | 'all') => void;
  setSearchTerm: (term: string) => void;
  setSelectedTags: (tags: string[]) => void;
  getFilteredFiles: () => PdfFile[];
  getAllTags: () => string[];
}

export const useFilesStore = create<FilesState>((set, get) => ({
  files: [],
  isLoading: false,
  selectedSubject: 'all',
  searchTerm: '',
  selectedTags: [],

  loadFiles: async () => {
    set({ isLoading: true });
    try {
      const files = await db.getPdfFiles();
      set({ files });
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addFile: async (file, subject, tags) => {
    const pdfFile: PdfFile = {
      id: crypto.randomUUID(),
      subject,
      folder: subject,
      name: file.name,
      size: file.size,
      tags,
      blobId: crypto.randomUUID(),
      addedAt: new Date().toISOString()
    };

    // Store file blob in IndexedDB
    const arrayBuffer = await file.arrayBuffer();
    await db.setPdfFiles([...get().files, pdfFile]);
    
    set({ files: [...get().files, pdfFile] });
  },

  deleteFile: async (fileId) => {
    const updatedFiles = get().files.filter(f => f.id !== fileId);
    await db.setPdfFiles(updatedFiles);
    set({ files: updatedFiles });
  },

  updateFileTags: async (fileId, tags) => {
    const updatedFiles = get().files.map(f =>
      f.id === fileId ? { ...f, tags } : f
    );
    await db.setPdfFiles(updatedFiles);
    set({ files: updatedFiles });
  },

  setSelectedSubject: (subject) => set({ selectedSubject: subject }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),

  getFilteredFiles: () => {
    const { files, selectedSubject, searchTerm, selectedTags } = get();
    
    return files.filter(file => {
      const matchesSubject = selectedSubject === 'all' || file.subject === selectedSubject;
      const matchesSearch = searchTerm === '' || 
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => file.tags.includes(tag));
      
      return matchesSubject && matchesSearch && matchesTags;
    });
  },

  getAllTags: () => {
    const { files } = get();
    const allTags = files.flatMap(file => file.tags);
    return Array.from(new Set(allTags)).sort();
  }
}));

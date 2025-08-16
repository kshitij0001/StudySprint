import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Layout } from './components/Layout';
import { useAppStore } from './store/useAppStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useSrsStore } from './store/useSrsStore';

// Pages
import Dashboard from './pages/Dashboard';
import Syllabus from './pages/Syllabus';
import Calendar from './pages/Calendar';
import Files from './pages/Files';
import Tests from './pages/Tests';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import NotFound from './pages/not-found';

function AppContent() {
  const { initializeApp, isLoading } = useAppStore();
  const { loadSettings } = useSettingsStore();
  const { loadData } = useSrsStore();

  useEffect(() => {
    const initialize = async () => {
      await initializeApp();
      await loadSettings();
      await loadData();
    };
    
    initialize();
  }, [initializeApp, loadSettings, loadData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading NEET 2026 App...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/plan" element={<Syllabus />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/files" element={<Files />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

function App() {
  const basename = import.meta.env.VITE_BASE_URL || '/';

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router basename={basename}>
            <AppContent />
          </Router>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

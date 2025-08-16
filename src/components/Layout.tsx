import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Button } from './ui/button';
import { Moon, Sun } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { useTheme } from './ThemeProvider';

export function Layout() {
  const isMobile = useMobile();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Sidebar />}

      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="glass"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </div>

      <main className={`${!isMobile ? 'ml-64' : ''} ${isMobile ? 'pb-24' : ''} pt-16`}>
        <div className="px-4 py-6">
          <Outlet />
        </div>
      </main>

      {isMobile && <MobileBottomNav />}
    </div>
  );
}
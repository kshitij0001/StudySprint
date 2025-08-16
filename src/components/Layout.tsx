import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Brain } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
        <div className="flex items-center justify-center p-4">
          <h1 className="text-lg font-bold text-primary flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            NEET 2026
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pt-16 lg:pt-0 pb-20 lg:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}

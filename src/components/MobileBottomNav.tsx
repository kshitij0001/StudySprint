
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  BarChart3, 
  Menu,
  BookOpen,
  Settings,
  FileText,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/progress', icon: BarChart3, label: 'Progress' },
];

const secondaryNavItems = [
  { to: '/syllabus', icon: BookOpen, label: 'Syllabus' },
  { to: '/tests', icon: FileText, label: 'Tests' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileBottomNav() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsMenuOpen(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Backdrop blur when menu is open */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 blur-background bg-black/20"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Bottom Navigation */}
      <nav 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out",
          isVisible ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Secondary Menu */}
        {isMenuOpen && (
          <div className="glass-popup mx-4 mb-2 p-3">
            <div className="grid grid-cols-3 gap-3">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-lg transition-colors",
                      isActive(item.to)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Bottom Bar */}
        <div className="glass px-4 py-2 mx-4 mb-4 rounded-2xl">
          <div className="flex items-center justify-around">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg transition-colors min-w-[60px]",
                    isActive(item.to)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg transition-colors min-w-[60px]",
                isMenuOpen
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 mb-1" />
              ) : (
                <Menu className="w-5 h-5 mb-1" />
              )}
              <span className="text-xs font-medium">More</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

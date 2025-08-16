import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  Folder, 
  TrendingUp, 
  PieChart, 
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Plan', href: '/plan', icon: BookOpen },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Files', href: '/files', icon: Folder },
  { name: 'Tests', href: '/tests', icon: TrendingUp },
  { name: 'Progress', href: '/progress', icon: PieChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function MobileBottomNav() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold - hide nav
        setIsVisible(false);
      } else {
        // Scrolling up - show nav
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav 
      className={cn(
        'lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 transition-transform duration-300',
        isVisible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="grid grid-cols-7 gap-1 px-2 py-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-colors min-h-[60px]',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              data-testid={`mobile-nav-${item.name.toLowerCase()}`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] leading-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
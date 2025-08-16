import { Link, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  Folder, 
  TrendingUp, 
  PieChart, 
  Settings, 
  Moon, 
  Sun,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Syllabus & Plan', href: '/plan', icon: BookOpen },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Files', href: '/files', icon: Folder },
  { name: 'Tests', href: '/tests', icon: TrendingUp },
  { name: 'Progress', href: '/progress', icon: PieChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <aside className="w-64 bg-card border-r border-border hidden lg:flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary flex items-center">
          <Brain className="mr-2 h-6 w-6" />
          NEET 2026
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Spaced Revision</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link 
              key={item.name} 
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 rounded-lg font-medium transition-colors',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-full justify-start"
          data-testid="button-toggle-theme"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-5 h-5 mr-2" />
              Dark Mode
            </>
          ) : (
            <>
              <Sun className="w-5 h-5 mr-2" />
              Light Mode
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

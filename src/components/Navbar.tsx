import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Home, BookOpen, Calendar, TrendingUp, User, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarColor } from '@/lib/avatarColors';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationCenter } from '@/components/NotificationCenter';
import { NetworkStatus } from '@/components/NetworkStatus';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;
  const avatarColor = user ? getAvatarColor(user.name) : '';

  // If not logged in, show minimal top nav
  if (!user) {
    return (
      <header className="sticky top-0 z-50 w-full bg-background border-b safe-top">
        <div className="w-full px-4 h-14 flex items-center justify-between">
          <Link to="/" className="text-lg font-display font-bold">
            LearnFlow
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => navigate('/login')} className="touch-target">
              Login
            </Button>
          </div>
        </div>
      </header>
    );
  }

  // Bottom navigation for logged-in students
  return (
    <>
      {/* Top bar with minimal info */}
      <header className="sticky top-0 z-50 w-full bg-background border-b safe-top">
        <div className="w-full px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-display font-bold">LearnFlow</span>
          <div className="flex items-center gap-1">
            <NetworkStatus />
            <ThemeToggle />
            <NotificationCenter />
          </div>
        </div>
      </header>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t safe-bottom shadow-lg">
        <div className="grid grid-cols-5 h-16">
          <Link
            to="/student/dashboard"
            className={`flex flex-col items-center justify-center gap-1 touch-target transition-colors ${
              isActive('/student/dashboard')
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>

          <Link
            to="/courses"
            className={`flex flex-col items-center justify-center gap-1 touch-target transition-colors ${
              isActive('/courses')
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs font-medium">Courses</span>
          </Link>

          <Link
            to="/student/workshops"
            className={`flex flex-col items-center justify-center gap-1 touch-target transition-colors ${
              isActive('/student/workshops')
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs font-medium">Workshops</span>
          </Link>

          <Link
            to="/student/progress"
            className={`flex flex-col items-center justify-center gap-1 touch-target transition-colors ${
              isActive('/student/progress')
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs font-medium">Progress</span>
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center gap-1 touch-target transition-colors ${
              isActive('/profile')
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <Avatar className="h-6 w-6 border" style={{ backgroundColor: avatarColor }}>
              <AvatarFallback className="text-white text-xs font-semibold">
                {user.name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

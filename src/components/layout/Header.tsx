import { MapPin, User, History, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onAuthClick: () => void;
}

export const Header = ({ onAuthClick }: HeaderProps) => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 px-6 py-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center shadow-glow">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">LocationFinder</h1>
            <p className="text-sm text-muted-foreground">Discover coordinates worldwide</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="sm" className="gap-2">
                <History className="w-4 h-4" />
                History
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Heart className="w-4 h-4" />
                Favorites
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" onClick={signOut}>
                <User className="w-4 h-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <Button onClick={onAuthClick} className="bg-gradient-hero hover:opacity-90 transition-all duration-300">
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
import { useState } from 'react';
import { MapInterface } from '@/components/map/MapInterface';
import { SearchPanel } from '@/components/search/SearchPanel';
import { Header } from '@/components/layout/Header';
import { AuthModal } from '@/components/auth/AuthModal';
import { HistoryPanel } from '@/components/history/HistoryPanel';
import { FavoritesPanel } from '@/components/favorites/FavoritesPanel';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    formatted_address: string;
  } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const { user } = useAuth();

  const handleHistoryClick = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to view your search history.",
      });
      setShowAuthModal(true);
      return;
    }
    setShowHistory(true);
  };

  const handleFavoritesClick = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to view your favorites.",
      });
      setShowAuthModal(true);
      return;
    }
    setShowFavorites(true);
  };

  return (
    <div className="h-screen bg-gradient-surface flex flex-col overflow-hidden">
      <Header 
        onAuthClick={() => setShowAuthModal(true)}
        onHistoryClick={handleHistoryClick}
        onFavoritesClick={handleFavoritesClick}
      />
      
      <div className="flex-1 flex relative">
        <SearchPanel 
          onLocationSelect={setSelectedLocation}
          selectedLocation={selectedLocation}
        />
        
        <div className="flex-1 relative">
          <MapInterface 
            selectedLocation={selectedLocation}
            onLocationSelect={setSelectedLocation}
          />
        </div>
      </div>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />

      <HistoryPanel
        open={showHistory}
        onOpenChange={setShowHistory}
        onLocationSelect={setSelectedLocation}
      />

      <FavoritesPanel
        open={showFavorites}
        onOpenChange={setShowFavorites}
        onLocationSelect={setSelectedLocation}
      />
    </div>
  );
};

export default Index;
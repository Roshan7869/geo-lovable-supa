import { useState } from 'react';
import { MapInterface } from '@/components/map/MapInterface';
import { SearchPanel } from '@/components/search/SearchPanel';
import { Header } from '@/components/layout/Header';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    formatted_address: string;
  } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  return (
    <div className="h-screen bg-gradient-surface flex flex-col overflow-hidden">
      <Header onAuthClick={() => setShowAuthModal(true)} />
      
      <div className="flex-1 flex relative">
        {/* Search Panel */}
        <SearchPanel 
          onLocationSelect={setSelectedLocation}
          selectedLocation={selectedLocation}
        />
        
        {/* Map Interface */}
        <div className="flex-1 relative">
          <MapInterface 
            selectedLocation={selectedLocation}
            onLocationSelect={setSelectedLocation}
          />
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
};

export default Index;
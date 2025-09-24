import { useState } from 'react';
import { Search, MapPin, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGeocode } from '@/hooks/useGeocode';
import { useAuth } from '@/hooks/useAuth';
import { LocationDetails } from '@/components/location/LocationDetails';

interface SearchPanelProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
    formatted_address: string;
  }) => void;
  selectedLocation: {
    latitude: number;
    longitude: number;
    address: string;
    formatted_address: string;
  } | null;
}

export const SearchPanel = ({ onLocationSelect, selectedLocation }: SearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { geocodeLocation, isLoading } = useGeocode();
  const { user } = useAuth();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const result = await geocodeLocation(searchQuery);
    if (result) {
      onLocationSelect(result);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-96 bg-card/95 backdrop-blur-sm border-r border-border/50 flex flex-col shadow-large">
      {/* Search Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Enter address, city, or coordinates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 border-border/50 focus:ring-primary focus:border-primary"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isLoading || !searchQuery.trim()}
            className="bg-gradient-hero hover:opacity-90 transition-all duration-300"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Location Details */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {selectedLocation ? (
          <LocationDetails location={selectedLocation} />
        ) : (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Find Any Location</h3>
            <p className="text-muted-foreground mb-6">
              Search for addresses, cities, landmarks, or enter coordinates to explore the world.
            </p>
            
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Precise latitude & longitude</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4" />
                <span>Save favorite locations</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Search history tracking</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Examples */}
      <div className="p-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground mb-3">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {['New York', 'Paris, France', 'Tokyo Tower', '40.7128, -74.0060'].map((example) => (
            <Badge 
              key={example}
              variant="secondary" 
              className="cursor-pointer hover:bg-secondary-hover transition-colors"
              onClick={() => setSearchQuery(example)}
            >
              {example}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
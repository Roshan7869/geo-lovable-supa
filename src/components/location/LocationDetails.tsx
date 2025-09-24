import { useState } from 'react';
import { Copy, Heart, MapPin, Globe, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface LocationDetailsProps {
  location: {
    latitude: number;
    longitude: number;
    address: string;
    formatted_address: string;
  };
}

export const LocationDetails = ({ location }: LocationDetailsProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully`,
    });
  };

  const handleFavorite = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return;
    }
    
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      description: isFavorited ? "Location removed from your favorites" : "Location saved to your favorites",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Location Header */}
      <Card className="p-4 bg-gradient-to-r from-primary-light to-accent-light border-primary/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-primary" />
              <Badge variant="outline" className="border-primary/30 text-primary">
                Location Found
              </Badge>
            </div>
            <h2 className="font-semibold text-foreground mb-1">
              {location.address}
            </h2>
            <p className="text-sm text-muted-foreground">
              {location.formatted_address}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavorite}
            className={`${isFavorited ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </Card>

      {/* Coordinates Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Navigation className="w-4 h-4" />
          Coordinates
        </h3>
        
        <div className="space-y-3">
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Latitude</p>
                <p className="text-lg font-mono text-primary">
                  {location.latitude.toFixed(6)}°
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(location.latitude.toString(), 'Latitude')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Longitude</p>
                <p className="text-lg font-mono text-primary">
                  {location.longitude.toFixed(6)}°
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(location.longitude.toString(), 'Longitude')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Coordinates</p>
                <p className="text-sm font-mono text-primary">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(
                  `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
                  'Coordinates'
                )}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button 
          className="w-full bg-gradient-hero hover:opacity-90 transition-all duration-300"
          onClick={() => window.open(`https://maps.google.com/?q=${location.latitude},${location.longitude}`, '_blank')}
        >
          <Globe className="w-4 h-4 mr-2" />
          Open in Google Maps
        </Button>
        
        <Button 
          variant="outline"
          className="w-full"
          onClick={() => copyToClipboard(
            `${location.address}\nLatitude: ${location.latitude.toFixed(6)}\nLongitude: ${location.longitude.toFixed(6)}`,
            'Location details'
          )}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy All Details
        </Button>
      </div>
    </div>
  );
};
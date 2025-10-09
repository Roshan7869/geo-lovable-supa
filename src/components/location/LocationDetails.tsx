import { useState, useEffect } from 'react';
import { Copy, Heart, MapPin, Globe, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const { user } = useAuth();

  // Check if location is favorited
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) return;

      const { data: locationDetail } = await supabase
        .from('location_details')
        .select('id')
        .eq('address', location.address)
        .maybeSingle();

      if (locationDetail) {
        const { data: favorite } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('location_detail_id', locationDetail.id)
          .maybeSingle();

        if (favorite) {
          setIsFavorited(true);
          setFavoriteId(favorite.id);
        }
      }
    };

    checkFavorite();
  }, [location.address, user]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully`,
    });
  };

  const handleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFavorited && favoriteId) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', favoriteId);

        if (error) throw error;

        setIsFavorited(false);
        setFavoriteId(null);
        toast({
          title: "Removed from favorites",
          description: "Location removed from your favorites",
        });
      } else {
        // Add to favorites
        // First, get or create location detail
        let { data: locationDetail } = await supabase
          .from('location_details')
          .select('id')
          .eq('address', location.address)
          .maybeSingle();

        if (!locationDetail) {
          const { data: newLocation, error: locationError } = await supabase
            .from('location_details')
            .insert({
              address: location.address,
              formatted_address: location.formatted_address,
              user_id: user.id,
            })
            .select()
            .single();

          if (locationError) throw locationError;
          locationDetail = newLocation;

          // Also save coordinates
          await supabase.from('location_coordinates').insert({
            latitude: location.latitude,
            longitude: location.longitude,
            location_detail_id: locationDetail.id,
          });
        }

        const { data: favorite, error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            location_detail_id: locationDetail.id,
            name: location.address,
          })
          .select()
          .single();

        if (error) throw error;

        setIsFavorited(true);
        setFavoriteId(favorite.id);
        toast({
          title: "Added to favorites",
          description: "Location saved to your favorites",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
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
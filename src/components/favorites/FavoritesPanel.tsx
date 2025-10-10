import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface FavoriteItem {
  id: string;
  name: string | null;
  notes: string | null;
  created_at: string;
  location_details: {
    address: string;
    formatted_address: string;
    latitude: number;
    longitude: number;
  } | null;
}

interface FavoritesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
    formatted_address: string;
  }) => void;
}

export const FavoritesPanel = ({ open, onOpenChange, onLocationSelect }: FavoritesPanelProps) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      fetchFavorites();
    }
  }, [open, user]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const { data: favData, error } = await supabase
        .from('favorites')
        .select(`
          id,
          name,
          notes,
          created_at,
          location_details (
            address,
            formatted_address,
            location_coordinates (
              latitude,
              longitude
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedFavorites = favData?.map(item => ({
        id: item.id,
        name: item.name,
        notes: item.notes,
        created_at: item.created_at,
        location_details: item.location_details ? {
          address: item.location_details.address,
          formatted_address: item.location_details.formatted_address || '',
          latitude: (item.location_details as any).location_coordinates?.[0]?.latitude || 0,
          longitude: (item.location_details as any).location_coordinates?.[0]?.longitude || 0,
        } : null
      })) || [];

      setFavorites(formattedFavorites);
    } catch (error: any) {
      toast({
        title: "Error loading favorites",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFavorites(favorites.filter(f => f.id !== id));
      toast({
        title: "Removed from favorites",
        description: "Location has been removed from your favorites.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing favorite",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSelectFavorite = (item: FavoriteItem) => {
    if (item.location_details) {
      onLocationSelect(item.location_details);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Favorite Locations
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar">
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading favorites...</p>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No favorites yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Click the heart icon on any location to save it
              </p>
            </div>
          ) : (
            favorites.map((item) => (
              <Card
                key={item.id}
                className="p-4 hover:bg-accent/5 transition-colors cursor-pointer group"
                onClick={() => handleSelectFavorite(item)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      {item.name && (
                        <h3 className="font-semibold text-sm mb-1 truncate">{item.name}</h3>
                      )}
                      {item.location_details && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.location_details.address}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {item.notes}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Saved {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

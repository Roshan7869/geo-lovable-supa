import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card } from '@/components/ui/card';
import { Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface HistoryItem {
  id: string;
  search_query: string;
  searched_at: string;
  location_details: {
    address: string;
    formatted_address: string;
    latitude: number;
    longitude: number;
  } | null;
}

interface HistoryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
    formatted_address: string;
  }) => void;
}

export const HistoryPanel = ({ open, onOpenChange, onLocationSelect }: HistoryPanelProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      fetchHistory();
    }
  }, [open, user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data: searchHistory, error } = await supabase
        .from('search_history')
        .select(`
          id,
          search_query,
          searched_at,
          location_details (
            address,
            formatted_address,
            location_coordinates (
              latitude,
              longitude
            )
          )
        `)
        .order('searched_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedHistory = searchHistory?.map(item => ({
        id: item.id,
        search_query: item.search_query,
        searched_at: item.searched_at,
        location_details: item.location_details ? {
          address: item.location_details.address,
          formatted_address: item.location_details.formatted_address || '',
          latitude: (item.location_details as any).location_coordinates?.[0]?.latitude || 0,
          longitude: (item.location_details as any).location_coordinates?.[0]?.longitude || 0,
        } : null
      })) || [];

      setHistory(formattedHistory);
    } catch (error: any) {
      toast({
        title: "Error loading history",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
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
            <Clock className="w-5 h-5" />
            Search History
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar">
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading history...</p>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No search history yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your searches will appear here
              </p>
            </div>
          ) : (
            history.map((item) => (
              <Card
                key={item.id}
                className="p-4 hover:bg-accent/5 transition-colors cursor-pointer"
                onClick={() => handleSelectHistory(item)}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.search_query}</h3>
                    {item.location_details && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {item.location_details.address}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(item.searched_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

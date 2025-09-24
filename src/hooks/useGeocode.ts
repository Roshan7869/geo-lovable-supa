import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useGeocode = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const geocodeLocation = async (address: string) => {
    setIsLoading(true);
    
    try {
      // First check if we have this location in our database
      const { data: existingLocation } = await supabase
        .from('location_details')
        .select(`
          *,
          location_coordinates (*)
        `)
        .ilike('address', `%${address}%`)
        .limit(1)
        .single();

      if (existingLocation && existingLocation.location_coordinates?.[0]) {
        const coords = existingLocation.location_coordinates[0];
        
        // Save to search history if user is logged in
        if (user) {
          await supabase.from('search_history').insert({
            user_id: user.id,
            search_query: address,
            location_detail_id: existingLocation.id
          });
        }

        setIsLoading(false);
        return {
          latitude: coords.latitude,
          longitude: coords.longitude,
          address: existingLocation.address,
          formatted_address: existingLocation.formatted_address || existingLocation.display_name || existingLocation.address
        };
      }

      // If not in database, call Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'LocationFinder/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        toast({
          title: "Location not found",
          description: "Please try a different search term or check your spelling.",
          variant: "destructive",
        });
        setIsLoading(false);
        return null;
      }

      const result = data[0];
      const latitude = parseFloat(result.lat);
      const longitude = parseFloat(result.lon);

      // Save to database
      const { data: locationDetail, error: locationError } = await supabase
        .from('location_details')
        .insert({
          user_id: user?.id,
          address,
          formatted_address: result.display_name,
          display_name: result.display_name,
          place_type: result.type,
          country: result.address?.country,
          state: result.address?.state,
          city: result.address?.city || result.address?.town || result.address?.village,
          postal_code: result.address?.postcode
        })
        .select()
        .single();

      if (locationError) {
        console.error('Error saving location:', locationError);
      } else {
        // Save coordinates
        await supabase.from('location_coordinates').insert({
          location_detail_id: locationDetail.id,
          latitude,
          longitude,
          accuracy: result.importance
        });

        // Save to search history if user is logged in
        if (user) {
          await supabase.from('search_history').insert({
            user_id: user.id,
            search_query: address,
            location_detail_id: locationDetail.id
          });
        }
      }

      setIsLoading(false);
      
      toast({
        title: "Location found!",
        description: "Location has been found and added to the map.",
      });

      return {
        latitude,
        longitude,
        address,
        formatted_address: result.display_name
      };

    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: "Search failed",
        description: "Unable to search for location. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return null;
    }
  };

  return {
    geocodeLocation,
    isLoading
  };
};
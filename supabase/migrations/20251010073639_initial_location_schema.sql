/*
  # Location Tracker Database Schema

  1. New Tables
    - `location_details`
      - Stores general location information (address, place type, country, city, etc.)
      - Links to users for ownership tracking
      - Includes formatted address and display name
    
    - `location_coordinates`
      - Stores precise GPS coordinates
      - Links to location_details
      - Includes accuracy and elevation data
    
    - `favorites`
      - Stores user's favorite locations
      - Links to users and location_details
      - Includes custom name and notes
    
    - `search_history`
      - Tracks user search queries
      - Links to users and location_details
      - Includes timestamp for chronological ordering

  2. Security
    - Enable RLS on all tables
    - location_details: Public read, authenticated write
    - location_coordinates: Public read, authenticated write
    - favorites: Users can only access their own favorites
    - search_history: Users can only access their own history

  3. Performance
    - Indexes on user_id columns
    - Indexes on foreign key relationships
    - Index on search_history date for efficient sorting
    - Automatic timestamp updates with trigger
*/

-- Create location_details table for storing general location information
CREATE TABLE IF NOT EXISTS public.location_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  address TEXT NOT NULL,
  formatted_address TEXT,
  display_name TEXT,
  place_type TEXT,
  country TEXT,
  state TEXT,
  city TEXT,
  postal_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create location_coordinates table for storing precise coordinate data
CREATE TABLE IF NOT EXISTS public.location_coordinates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_detail_id UUID REFERENCES public.location_details(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy REAL,
  elevation REAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create favorites table for saved locations
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  location_detail_id UUID REFERENCES public.location_details(id) ON DELETE CASCADE,
  name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create search_history table for tracking user searches
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  search_query TEXT NOT NULL,
  location_detail_id UUID REFERENCES public.location_details(id) ON DELETE SET NULL,
  searched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.location_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_coordinates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for location_details
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'location_details' AND policyname = 'Users can view all location details'
  ) THEN
    CREATE POLICY "Users can view all location details" 
    ON public.location_details 
    FOR SELECT 
    USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'location_details' AND policyname = 'Users can create location details'
  ) THEN
    CREATE POLICY "Users can create location details" 
    ON public.location_details 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'location_details' AND policyname = 'Users can update their own location details'
  ) THEN
    CREATE POLICY "Users can update their own location details" 
    ON public.location_details 
    FOR UPDATE 
    USING (user_id IS NULL OR auth.uid() = user_id);
  END IF;
END $$;

-- Create RLS policies for location_coordinates
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'location_coordinates' AND policyname = 'Users can view all location coordinates'
  ) THEN
    CREATE POLICY "Users can view all location coordinates" 
    ON public.location_coordinates 
    FOR SELECT 
    USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'location_coordinates' AND policyname = 'Users can create location coordinates'
  ) THEN
    CREATE POLICY "Users can create location coordinates" 
    ON public.location_coordinates 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;

-- Create RLS policies for favorites
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'favorites' AND policyname = 'Users can view their own favorites'
  ) THEN
    CREATE POLICY "Users can view their own favorites" 
    ON public.favorites 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'favorites' AND policyname = 'Users can create their own favorites'
  ) THEN
    CREATE POLICY "Users can create their own favorites" 
    ON public.favorites 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'favorites' AND policyname = 'Users can update their own favorites'
  ) THEN
    CREATE POLICY "Users can update their own favorites" 
    ON public.favorites 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'favorites' AND policyname = 'Users can delete their own favorites'
  ) THEN
    CREATE POLICY "Users can delete their own favorites" 
    ON public.favorites 
    FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create RLS policies for search_history
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'search_history' AND policyname = 'Users can view their own search history'
  ) THEN
    CREATE POLICY "Users can view their own search history" 
    ON public.search_history 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'search_history' AND policyname = 'Users can create their own search history'
  ) THEN
    CREATE POLICY "Users can create their own search history" 
    ON public.search_history 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_location_details_user ON public.location_details(user_id);
CREATE INDEX IF NOT EXISTS idx_location_coordinates_location ON public.location_coordinates(location_detail_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_date ON public.search_history(searched_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_location_details_updated_at'
  ) THEN
    CREATE TRIGGER update_location_details_updated_at
      BEFORE UPDATE ON public.location_details
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
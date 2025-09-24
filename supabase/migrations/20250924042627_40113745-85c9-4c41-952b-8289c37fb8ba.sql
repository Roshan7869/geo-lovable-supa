-- Create location_details table for storing general location information
CREATE TABLE public.location_details (
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
CREATE TABLE public.location_coordinates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_detail_id UUID REFERENCES public.location_details(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy REAL,
  elevation REAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create favorites table for saved locations
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  location_detail_id UUID REFERENCES public.location_details(id) ON DELETE CASCADE,
  name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create search_history table for tracking user searches
CREATE TABLE public.search_history (
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
CREATE POLICY "Users can view all location details" 
ON public.location_details 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create location details" 
ON public.location_details 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own location details" 
ON public.location_details 
FOR UPDATE 
USING (user_id IS NULL OR auth.uid() = user_id);

-- Create RLS policies for location_coordinates
CREATE POLICY "Users can view all location coordinates" 
ON public.location_coordinates 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create location coordinates" 
ON public.location_coordinates 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for favorites
CREATE POLICY "Users can view their own favorites" 
ON public.favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
ON public.favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites" 
ON public.favorites 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for search_history
CREATE POLICY "Users can view their own search history" 
ON public.search_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search history" 
ON public.search_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_location_details_user ON public.location_details(user_id);
CREATE INDEX idx_location_coordinates_location ON public.location_coordinates(location_detail_id);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_search_history_user ON public.search_history(user_id);
CREATE INDEX idx_search_history_date ON public.search_history(searched_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_location_details_updated_at
  BEFORE UPDATE ON public.location_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
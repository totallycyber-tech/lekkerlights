-- Create listings table for Christmas displays
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  complex_name TEXT,
  unit_no TEXT,
  street_number TEXT NOT NULL,
  street_name TEXT NOT NULL,
  suburb TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  contact_email TEXT,
  contact_phone TEXT,
  google_drive_urls TEXT[] DEFAULT '{}',
  youtube_urls TEXT[] DEFAULT '{}',
  operating_hours JSONB DEFAULT '{}',
  directions_clicks INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view listings)
CREATE POLICY "Listings are viewable by everyone" 
ON public.listings 
FOR SELECT 
USING (true);

-- Create policy for public insert access (anyone can create a listing)
CREATE POLICY "Anyone can create listings" 
ON public.listings 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for location-based queries
CREATE INDEX idx_listings_province ON public.listings(province);
CREATE INDEX idx_listings_city ON public.listings(city);
CREATE INDEX idx_listings_suburb ON public.listings(suburb);
-- Add short_code column to listings table
ALTER TABLE public.listings 
ADD COLUMN short_code text UNIQUE;

-- Add short_code column to listings_public_data table
ALTER TABLE public.listings_public_data 
ADD COLUMN short_code text;

-- Create a function to generate unique short codes
CREATE OR REPLACE FUNCTION public.generate_short_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := 'LL-';
  i integer;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Generate short codes for all existing listings that don't have one
UPDATE public.listings
SET short_code = public.generate_short_code()
WHERE short_code IS NULL;

-- Make short_code NOT NULL after populating existing records
ALTER TABLE public.listings 
ALTER COLUMN short_code SET NOT NULL,
ALTER COLUMN short_code SET DEFAULT public.generate_short_code();

-- Create index for fast lookups
CREATE INDEX idx_listings_short_code ON public.listings(short_code);
CREATE INDEX idx_listings_public_data_short_code ON public.listings_public_data(short_code);

-- Update the sync trigger to include short_code
CREATE OR REPLACE FUNCTION public.sync_listings_public_data()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    DELETE FROM public.listings_public_data WHERE id = OLD.id;
    RETURN OLD;
  END IF;

  INSERT INTO public.listings_public_data (
    id,
    created_at,
    updated_at,
    lat,
    lng,
    max_visitors,
    operating_hours,
    name_visible,
    email_visible,
    phone_visible,
    directions_clicks,
    favorites_count,
    has_cover_photo,
    street_number,
    street_name,
    suburb,
    city,
    province,
    postal_code,
    complex_name,
    unit_no,
    description,
    parking_info,
    gate_access_info,
    image_urls,
    youtube_urls,
    tags,
    title,
    contact_name,
    contact_email,
    contact_phone,
    short_code
  )
  VALUES (
    NEW.id,
    NEW.created_at,
    NEW.updated_at,
    NEW.lat,
    NEW.lng,
    NEW.max_visitors,
    NEW.operating_hours,
    NEW.name_visible,
    NEW.email_visible,
    NEW.phone_visible,
    NEW.directions_clicks,
    NEW.favorites_count,
    NEW.has_cover_photo,
    NEW.street_number,
    NEW.street_name,
    NEW.suburb,
    NEW.city,
    NEW.province,
    NEW.postal_code,
    NEW.complex_name,
    NEW.unit_no,
    NEW.description,
    NEW.parking_info,
    NEW.gate_access_info,
    NEW.image_urls,
    NEW.youtube_urls,
    NEW.tags,
    NEW.title,
    CASE WHEN NEW.name_visible THEN NEW.contact_name ELSE NULL END,
    CASE WHEN NEW.email_visible THEN NEW.contact_email ELSE NULL END,
    CASE WHEN NEW.phone_visible THEN NEW.contact_phone ELSE NULL END,
    NEW.short_code
  )
  ON CONFLICT (id) DO UPDATE SET
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    max_visitors = EXCLUDED.max_visitors,
    operating_hours = EXCLUDED.operating_hours,
    name_visible = EXCLUDED.name_visible,
    email_visible = EXCLUDED.email_visible,
    phone_visible = EXCLUDED.phone_visible,
    directions_clicks = EXCLUDED.directions_clicks,
    favorites_count = EXCLUDED.favorites_count,
    has_cover_photo = EXCLUDED.has_cover_photo,
    street_number = EXCLUDED.street_number,
    street_name = EXCLUDED.street_name,
    suburb = EXCLUDED.suburb,
    city = EXCLUDED.city,
    province = EXCLUDED.province,
    postal_code = EXCLUDED.postal_code,
    complex_name = EXCLUDED.complex_name,
    unit_no = EXCLUDED.unit_no,
    description = EXCLUDED.description,
    parking_info = EXCLUDED.parking_info,
    gate_access_info = EXCLUDED.gate_access_info,
    image_urls = EXCLUDED.image_urls,
    youtube_urls = EXCLUDED.youtube_urls,
    tags = EXCLUDED.tags,
    title = EXCLUDED.title,
    contact_name = EXCLUDED.contact_name,
    contact_email = EXCLUDED.contact_email,
    contact_phone = EXCLUDED.contact_phone,
    short_code = EXCLUDED.short_code;

  RETURN NEW;
END;
$function$;

-- Sync existing listings to listings_public_data to populate short_code
UPDATE public.listings SET updated_at = now() WHERE short_code IS NOT NULL;
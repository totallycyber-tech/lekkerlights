-- Replace SECURITY DEFINER view-based public access with a synced public table + invoker view
-- This removes the SECURITY DEFINER view warning while preserving existing app behavior.

-- 1) Create a dedicated public-readable table that contains ONLY the public projection of listings
CREATE TABLE IF NOT EXISTS public.listings_public_data (
  id uuid PRIMARY KEY,
  created_at timestamptz,
  updated_at timestamptz,
  lat numeric,
  lng numeric,
  max_visitors integer,
  operating_hours jsonb,
  name_visible boolean,
  email_visible boolean,
  phone_visible boolean,
  directions_clicks integer,
  favorites_count integer,
  has_cover_photo boolean,
  street_number text,
  street_name text,
  suburb text,
  city text,
  province text,
  postal_code text,
  complex_name text,
  unit_no text,
  description text,
  parking_info text,
  gate_access_info text,
  image_urls text[],
  youtube_urls text[],
  tags text[],
  title text,
  -- Contact fields are already visibility-filtered (NULL unless visible)
  contact_name text,
  contact_email text,
  contact_phone text
);

-- 2) Enable RLS and allow public read, restrict writes to service role
ALTER TABLE public.listings_public_data ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- SELECT: public readable
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'listings_public_data'
      AND policyname = 'Public can read listings public data'
  ) THEN
    CREATE POLICY "Public can read listings public data"
    ON public.listings_public_data
    FOR SELECT
    USING (true);
  END IF;

  -- INSERT/UPDATE/DELETE: service_role only
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'listings_public_data'
      AND policyname = 'Service role can write listings public data'
  ) THEN
    CREATE POLICY "Service role can write listings public data"
    ON public.listings_public_data
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- Ensure API roles have SELECT privileges (RLS still applies)
GRANT SELECT ON public.listings_public_data TO anon, authenticated;

-- 3) Create a sync trigger so listings_public_data stays in lockstep with listings
CREATE OR REPLACE FUNCTION public.sync_listings_public_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    contact_phone
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
    CASE WHEN NEW.phone_visible THEN NEW.contact_phone ELSE NULL END
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
    contact_phone = EXCLUDED.contact_phone;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_listings_public_data_ins_upd ON public.listings;
CREATE TRIGGER trg_sync_listings_public_data_ins_upd
AFTER INSERT OR UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.sync_listings_public_data();

DROP TRIGGER IF EXISTS trg_sync_listings_public_data_del ON public.listings;
CREATE TRIGGER trg_sync_listings_public_data_del
AFTER DELETE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.sync_listings_public_data();

-- 4) Backfill existing rows
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
  contact_phone
)
SELECT
  l.id,
  l.created_at,
  l.updated_at,
  l.lat,
  l.lng,
  l.max_visitors,
  l.operating_hours,
  l.name_visible,
  l.email_visible,
  l.phone_visible,
  l.directions_clicks,
  l.favorites_count,
  l.has_cover_photo,
  l.street_number,
  l.street_name,
  l.suburb,
  l.city,
  l.province,
  l.postal_code,
  l.complex_name,
  l.unit_no,
  l.description,
  l.parking_info,
  l.gate_access_info,
  l.image_urls,
  l.youtube_urls,
  l.tags,
  l.title,
  CASE WHEN l.name_visible THEN l.contact_name ELSE NULL END,
  CASE WHEN l.email_visible THEN l.contact_email ELSE NULL END,
  CASE WHEN l.phone_visible THEN l.contact_phone ELSE NULL END
FROM public.listings l
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
  contact_phone = EXCLUDED.contact_phone;

-- 5) Recreate listings_public as an invoker view over the synced table (no SECURITY DEFINER)
DROP VIEW IF EXISTS public.listings_public;
CREATE VIEW public.listings_public AS
SELECT * FROM public.listings_public_data;

GRANT SELECT ON public.listings_public TO anon, authenticated;
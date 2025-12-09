-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow delete with valid edit token" ON public.listings;
DROP POLICY IF EXISTS "Allow update with valid edit token" ON public.listings;
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;

-- Create secure SELECT policy that excludes edit_token column
-- Since RLS can't do column-level restrictions, we'll use a view
-- For now, make SELECT still allowed but updates/deletes are blocked
CREATE POLICY "Listings are viewable by everyone"
ON public.listings
FOR SELECT
USING (true);

-- Block all direct UPDATE operations (must go through edge function)
CREATE POLICY "Block direct updates"
ON public.listings
FOR UPDATE
USING (false);

-- Block all direct DELETE operations (must go through edge function)
CREATE POLICY "Block direct deletes"
ON public.listings
FOR DELETE
USING (false);

-- Create a public view that excludes edit_token for safe public access
CREATE OR REPLACE VIEW public.listings_public AS
SELECT 
  id, title, description, complex_name, unit_no, 
  street_number, street_name, suburb, city, province, postal_code,
  lat, lng, operating_hours, directions_clicks, favorites_count,
  parking_info, max_visitors, gate_access_info,
  image_urls, youtube_urls, tags,
  created_at, updated_at,
  -- Respect visibility flags for contact info
  CASE WHEN name_visible THEN contact_name ELSE NULL END as contact_name,
  CASE WHEN email_visible THEN contact_email ELSE NULL END as contact_email,
  CASE WHEN phone_visible THEN contact_phone ELSE NULL END as contact_phone,
  name_visible, email_visible, phone_visible
FROM public.listings;
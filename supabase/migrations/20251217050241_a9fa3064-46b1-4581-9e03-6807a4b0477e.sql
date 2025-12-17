-- Recreate listings_public view with SECURITY DEFINER (security_invoker = false)
-- This is required for public access since the underlying listings table has restrictive RLS

DROP VIEW IF EXISTS public.listings_public;

CREATE VIEW public.listings_public 
WITH (security_invoker = false) AS
SELECT 
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
  province,
  postal_code,
  complex_name,
  parking_info,
  gate_access_info,
  image_urls,
  youtube_urls,
  tags,
  title,
  CASE WHEN name_visible THEN contact_name ELSE NULL END AS contact_name,
  CASE WHEN email_visible THEN contact_email ELSE NULL END AS contact_email,
  CASE WHEN phone_visible THEN contact_phone ELSE NULL END AS contact_phone,
  unit_no,
  street_number,
  street_name,
  suburb,
  city,
  description
FROM public.listings;
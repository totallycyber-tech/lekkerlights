-- Fix the view to use SECURITY INVOKER (default) instead of SECURITY DEFINER
DROP VIEW IF EXISTS public.listings_public;

CREATE VIEW public.listings_public
WITH (security_invoker = true)
AS
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
-- Update the listings_public view to include has_cover_photo
DROP VIEW IF EXISTS public.listings_public;

CREATE VIEW public.listings_public AS
SELECT
  l.id,
  l.created_at,
  l.updated_at,
  l.title,
  l.description,
  l.lat,
  l.lng,
  l.max_visitors,
  l.operating_hours,
  l.unit_no,
  l.street_number,
  l.street_name,
  l.suburb,
  l.city,
  l.province,
  l.postal_code,
  l.complex_name,
  l.parking_info,
  l.gate_access_info,
  l.image_urls,
  l.youtube_urls,
  l.tags,
  l.name_visible,
  l.email_visible,
  l.phone_visible,
  l.directions_clicks,
  l.favorites_count,
  l.has_cover_photo,
  -- Only show contact info if visibility flags are true
  CASE WHEN l.name_visible THEN l.contact_name ELSE NULL END AS contact_name,
  CASE WHEN l.email_visible THEN l.contact_email ELSE NULL END AS contact_email,
  CASE WHEN l.phone_visible THEN l.contact_phone ELSE NULL END AS contact_phone
FROM public.listings l;
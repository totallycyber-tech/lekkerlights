-- Update listings_public view to include short_code
DROP VIEW IF EXISTS public.listings_public;

CREATE VIEW public.listings_public AS
SELECT 
    l.id,
    l.title,
    l.description,
    l.complex_name,
    l.unit_no,
    l.street_number,
    l.street_name,
    l.suburb,
    l.city,
    l.province,
    l.postal_code,
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
    l.image_urls,
    l.youtube_urls,
    l.tags,
    l.parking_info,
    l.gate_access_info,
    l.short_code,
    l.created_at,
    l.updated_at,
    -- Conditionally show contact info based on visibility flags
    CASE WHEN l.name_visible THEN l.contact_name ELSE NULL END AS contact_name,
    CASE WHEN l.email_visible THEN l.contact_email ELSE NULL END AS contact_email,
    CASE WHEN l.phone_visible THEN l.contact_phone ELSE NULL END AS contact_phone
FROM listings l;
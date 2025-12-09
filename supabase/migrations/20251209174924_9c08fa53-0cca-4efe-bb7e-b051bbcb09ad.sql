-- Recreate view with explicit SECURITY INVOKER to address linter warning
DROP VIEW IF EXISTS public.listings_public;

CREATE VIEW public.listings_public 
WITH (security_invoker = true) AS
SELECT
    id,
    created_at,
    updated_at,
    title,
    description,
    lat,
    lng,
    max_visitors,
    operating_hours,
    unit_no,
    street_number,
    street_name,
    suburb,
    city,
    province,
    postal_code,
    complex_name,
    parking_info,
    gate_access_info,
    image_urls,
    youtube_urls,
    tags,
    name_visible,
    email_visible,
    phone_visible,
    directions_clicks,
    favorites_count,
    CASE WHEN name_visible THEN contact_name ELSE NULL END AS contact_name,
    CASE WHEN email_visible THEN contact_email ELSE NULL END AS contact_email,
    CASE WHEN phone_visible THEN contact_phone ELSE NULL END AS contact_phone
FROM public.listings;
-- Create a separate secure table for edit tokens with NO public SELECT access
CREATE TABLE public.listing_edit_tokens (
    listing_id UUID NOT NULL PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
    edit_token UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.listing_edit_tokens ENABLE ROW LEVEL SECURITY;

-- NO SELECT policy - tokens can only be accessed via service role in edge functions
-- This means no one can read tokens directly from the client

-- Allow inserts (for creating new listings)
CREATE POLICY "Anyone can create edit tokens"
ON public.listing_edit_tokens
FOR INSERT
WITH CHECK (true);

-- Block direct updates and deletes (only via service role)
CREATE POLICY "Block direct updates on edit tokens"
ON public.listing_edit_tokens
FOR UPDATE
USING (false);

CREATE POLICY "Block direct deletes on edit tokens"
ON public.listing_edit_tokens
FOR DELETE
USING (false);

-- Migrate existing edit tokens to new table
INSERT INTO public.listing_edit_tokens (listing_id, edit_token, created_at)
SELECT id, COALESCE(edit_token, gen_random_uuid()), created_at
FROM public.listings
WHERE id IS NOT NULL
ON CONFLICT (listing_id) DO NOTHING;

-- Update the listings_public view to ensure edit_token is never exposed
-- (the current view already doesn't include it, but let's be explicit)
DROP VIEW IF EXISTS public.listings_public;

CREATE VIEW public.listings_public AS
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
    -- Conditionally show contact info based on visibility flags
    CASE WHEN name_visible THEN contact_name ELSE NULL END AS contact_name,
    CASE WHEN email_visible THEN contact_email ELSE NULL END AS contact_email,
    CASE WHEN phone_visible THEN contact_phone ELSE NULL END AS contact_phone
FROM public.listings;
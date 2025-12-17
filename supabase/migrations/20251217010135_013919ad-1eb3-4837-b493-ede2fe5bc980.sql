-- Add revision column to listings table
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS revision integer NOT NULL DEFAULT 1;

-- Create listing_revisions table to track changes
CREATE TABLE public.listing_revisions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL,
  revision integer NOT NULL,
  changes_summary text NOT NULL,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  changed_fields text[] NOT NULL DEFAULT '{}'::text[]
);

-- Enable RLS on listing_revisions
ALTER TABLE public.listing_revisions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert revisions (via edge function)
CREATE POLICY "Anyone can create revisions" ON public.listing_revisions
FOR INSERT WITH CHECK (true);

-- Block direct updates/deletes
CREATE POLICY "Block direct updates on revisions" ON public.listing_revisions
FOR UPDATE USING (false);

CREATE POLICY "Block direct deletes on revisions" ON public.listing_revisions
FOR DELETE USING (false);

-- Public can read revisions
CREATE POLICY "Public can read revisions" ON public.listing_revisions
FOR SELECT USING (true);

-- Create index for faster lookups
CREATE INDEX idx_listing_revisions_listing_id ON public.listing_revisions(listing_id);
CREATE INDEX idx_listing_revisions_revision ON public.listing_revisions(listing_id, revision);
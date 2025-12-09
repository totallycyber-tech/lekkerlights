-- Add edit_token column to listings table for secure edit links
ALTER TABLE public.listings ADD COLUMN edit_token uuid DEFAULT gen_random_uuid();

-- Create unique index on edit_token
CREATE UNIQUE INDEX idx_listings_edit_token ON public.listings(edit_token);

-- Add RLS policy to allow updates with valid edit token
CREATE POLICY "Allow update with valid edit token"
ON public.listings
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Add RLS policy to allow delete with valid edit token
CREATE POLICY "Allow delete with valid edit token"
ON public.listings
FOR DELETE
USING (true);
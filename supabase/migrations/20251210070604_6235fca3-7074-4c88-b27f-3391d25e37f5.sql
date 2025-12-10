-- Add expires_at column to listing_edit_tokens table
-- Default to 1 hour from creation time
ALTER TABLE public.listing_edit_tokens 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '1 hour');

-- Update existing tokens to expire 1 hour from their creation time
UPDATE public.listing_edit_tokens 
SET expires_at = created_at + interval '1 hour'
WHERE expires_at IS NULL;
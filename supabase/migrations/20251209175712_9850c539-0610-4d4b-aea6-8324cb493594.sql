-- Remove the legacy edit_token column from listings table
-- This column is no longer used - tokens are now stored securely in listing_edit_tokens table
ALTER TABLE public.listings DROP COLUMN IF EXISTS edit_token;
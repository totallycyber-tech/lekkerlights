-- Add tags column to listings table
ALTER TABLE public.listings ADD COLUMN tags text[] DEFAULT '{}'::text[];
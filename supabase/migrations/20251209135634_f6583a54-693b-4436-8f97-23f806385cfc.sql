-- Add visibility columns for contact information
ALTER TABLE public.listings 
ADD COLUMN email_visible boolean NOT NULL DEFAULT true,
ADD COLUMN phone_visible boolean NOT NULL DEFAULT true;
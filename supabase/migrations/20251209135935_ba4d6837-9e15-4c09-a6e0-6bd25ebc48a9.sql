-- Add contact name and visibility column
ALTER TABLE public.listings 
ADD COLUMN contact_name text,
ADD COLUMN name_visible boolean NOT NULL DEFAULT true;
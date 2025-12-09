-- Add visit guidance columns
ALTER TABLE public.listings 
ADD COLUMN parking_info text,
ADD COLUMN max_visitors integer,
ADD COLUMN gate_access_info text;
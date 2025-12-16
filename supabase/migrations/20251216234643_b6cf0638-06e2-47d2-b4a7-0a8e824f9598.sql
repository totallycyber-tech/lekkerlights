-- Add has_cover_photo flag to distinguish explicit cover photos from additional photos
ALTER TABLE public.listings 
ADD COLUMN has_cover_photo boolean NOT NULL DEFAULT false;

-- Update existing listings: set has_cover_photo = false for all
-- (since bulk listings didn't have explicit cover photos)
UPDATE public.listings SET has_cover_photo = false;
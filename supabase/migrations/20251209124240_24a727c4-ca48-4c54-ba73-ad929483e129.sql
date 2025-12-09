-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true);

-- Allow anyone to upload images (no auth required for this app)
CREATE POLICY "Anyone can upload listing images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'listing-images');

-- Allow anyone to view listing images
CREATE POLICY "Anyone can view listing images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'listing-images');

-- Allow anyone to delete their uploaded images (during form editing)
CREATE POLICY "Anyone can delete listing images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'listing-images');

-- Rename google_drive_urls to image_urls
ALTER TABLE public.listings
RENAME COLUMN google_drive_urls TO image_urls;
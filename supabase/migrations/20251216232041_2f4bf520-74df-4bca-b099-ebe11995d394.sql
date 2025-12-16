-- Drop the permissive storage upload policy
DROP POLICY IF EXISTS "Anyone can upload listing images" ON storage.objects;

-- Create a new restrictive policy that only allows service_role to upload
CREATE POLICY "Only service role can upload listing images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'listing-images' AND (auth.role() = 'service_role'));
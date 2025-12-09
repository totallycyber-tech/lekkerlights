-- Drop existing permissive delete policy if it exists
DROP POLICY IF EXISTS "Anyone can delete listing images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete for listing images" ON storage.objects;

-- Create restrictive delete policy - only service role can delete (via edge functions)
CREATE POLICY "Only service role can delete listing images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'listing-images' AND false);

-- Note: The 'false' ensures no direct client deletions are allowed
-- Deletions will go through the delete-listing-image edge function which uses service role
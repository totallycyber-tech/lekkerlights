-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can create listings" ON public.listings;

-- Create a PERMISSIVE INSERT policy
CREATE POLICY "Anyone can create listings"
ON public.listings
FOR INSERT
TO public
WITH CHECK (true);
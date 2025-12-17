-- Fix INSERT RLS policy to explicitly allow anon/authenticated roles
-- (Using TO public has proven unreliable in this environment)

DROP POLICY IF EXISTS "Anyone can create listings" ON public.listings;

CREATE POLICY "Anyone can create listings"
ON public.listings
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

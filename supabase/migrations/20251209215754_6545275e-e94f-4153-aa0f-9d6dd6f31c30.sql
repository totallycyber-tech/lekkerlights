-- Fix: Revoke direct SELECT access to listings table to prevent contact info exposure
-- The listings_public view properly filters sensitive data based on visibility flags

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;

-- Create a new restrictive SELECT policy that only allows service role access
-- This ensures all public access must go through the listings_public view
CREATE POLICY "Only service role can select listings directly"
ON public.listings
FOR SELECT
USING (auth.role() = 'service_role');
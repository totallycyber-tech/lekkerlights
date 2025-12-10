-- Add a SELECT policy to completely block public SELECT on listing_edit_tokens
CREATE POLICY "Block public select on edit tokens" 
ON public.listing_edit_tokens 
FOR SELECT 
USING (false);
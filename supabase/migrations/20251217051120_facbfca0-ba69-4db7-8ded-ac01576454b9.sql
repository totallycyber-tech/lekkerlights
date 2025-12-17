-- Ensure the public projection view uses invoker privileges (not SECURITY DEFINER)

DROP VIEW IF EXISTS public.listings_public;

CREATE VIEW public.listings_public
WITH (security_invoker = true) AS
SELECT *
FROM public.listings_public_data;

GRANT SELECT ON public.listings_public TO anon, authenticated;
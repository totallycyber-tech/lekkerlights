-- Allow title and description to be nullable
ALTER TABLE public.listings ALTER COLUMN title DROP NOT NULL;
ALTER TABLE public.listings ALTER COLUMN description DROP NOT NULL;
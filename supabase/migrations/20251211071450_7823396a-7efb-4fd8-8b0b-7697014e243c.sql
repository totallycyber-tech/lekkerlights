-- Create batch_edit_tokens table for managing bulk listing edit links
CREATE TABLE public.batch_edit_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  edit_token UUID NOT NULL DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '1 hour')
);

-- Add batch_id column to listings table
ALTER TABLE public.listings ADD COLUMN batch_id UUID DEFAULT NULL;

-- Enable RLS on batch_edit_tokens
ALTER TABLE public.batch_edit_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for batch_edit_tokens (same pattern as listing_edit_tokens)
CREATE POLICY "Anyone can create batch edit tokens"
ON public.batch_edit_tokens
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Block public select on batch edit tokens"
ON public.batch_edit_tokens
FOR SELECT
USING (false);

CREATE POLICY "Block direct updates on batch edit tokens"
ON public.batch_edit_tokens
FOR UPDATE
USING (false);

CREATE POLICY "Block direct deletes on batch edit tokens"
ON public.batch_edit_tokens
FOR DELETE
USING (false);
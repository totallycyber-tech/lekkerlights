-- Add submitter_notes column for organizing listings (private, not displayed publicly)
ALTER TABLE public.listings 
ADD COLUMN submitter_notes text;
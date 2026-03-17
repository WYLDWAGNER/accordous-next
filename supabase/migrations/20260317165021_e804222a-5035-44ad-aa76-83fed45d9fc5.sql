
-- Add addendums JSONB column to contracts table for storing amendment history
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS addendums jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.contracts.addendums IS 'Array of contract amendments/addendums with history';

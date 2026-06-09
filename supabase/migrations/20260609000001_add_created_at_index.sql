-- Add index on properties.created_at
-- All property listing queries use ORDER BY created_at DESC but no index exists.
-- This index scan replaces the full sequential scan on every page load.
CREATE INDEX IF NOT EXISTS idx_properties_created_at
  ON public.properties(created_at DESC);

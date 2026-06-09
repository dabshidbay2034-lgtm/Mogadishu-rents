-- Add RLS policy for admins and semi_admins to view views column
-- This doesn't change data visibility, but documents access pattern

-- Note: The views column is already accessible to admins/semi_admins via existing SELECT policies
-- This migration adds a comment to document the intended access pattern

COMMENT ON COLUMN public.properties.views IS 'View count - visible to property owner, admins, and semi_admins only in UI';

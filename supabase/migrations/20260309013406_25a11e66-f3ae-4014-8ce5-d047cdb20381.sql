-- Add views column to properties table
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

-- Create function to safely increment views
CREATE OR REPLACE FUNCTION public.increment_property_view(property_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.properties
  SET views = views + 1
  WHERE id = property_id;
END;
$$;
-- Add is_hidden field to properties table for admin control
ALTER TABLE public.properties 
ADD COLUMN is_hidden boolean NOT NULL DEFAULT false;

-- Create admin-specific policies for full access
CREATE POLICY "Admins can view all properties including hidden" 
ON public.properties 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Update existing properties policy to exclude hidden properties for non-admins
DROP POLICY IF EXISTS "Properties viewable by everyone" ON public.properties;
CREATE POLICY "Properties viewable by everyone (excluding hidden)" 
ON public.properties 
FOR SELECT 
USING (NOT is_hidden OR public.has_role(auth.uid(), 'admin'));

-- Admin can update any property
CREATE POLICY "Admins can update any property" 
ON public.properties 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete any property
CREATE POLICY "Admins can delete any property" 
ON public.properties 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));
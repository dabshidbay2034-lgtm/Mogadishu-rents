
-- Allow admins to view all user_roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any user role
CREATE POLICY "Admins can update any user role"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all profiles (already have public SELECT, but let's ensure admin coverage)
-- profiles already has "Profiles viewable by everyone" so no change needed there

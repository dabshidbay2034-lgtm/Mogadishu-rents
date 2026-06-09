-- Semi admins can view all properties including hidden
CREATE POLICY "Semi admins can view all properties"
ON public.properties FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'semi_admin'));

-- Semi admins can view all user roles
CREATE POLICY "Semi admins can view all user roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'semi_admin'));
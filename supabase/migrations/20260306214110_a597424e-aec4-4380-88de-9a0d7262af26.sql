
-- Fix: restrict inquiry inserts to authenticated users only
DROP POLICY "Users can insert inquiries" ON public.inquiries;
CREATE POLICY "Authenticated users can insert inquiries" ON public.inquiries
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

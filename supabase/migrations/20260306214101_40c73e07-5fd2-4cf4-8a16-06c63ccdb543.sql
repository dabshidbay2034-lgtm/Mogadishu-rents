
-- Inquiries table for property contact requests
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can send an inquiry
CREATE POLICY "Users can insert inquiries" ON public.inquiries
FOR INSERT WITH CHECK (true);

-- Property owners can view inquiries for their properties
CREATE POLICY "Owners can view their property inquiries" ON public.inquiries
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND owner_id = auth.uid())
  OR sender_id = auth.uid()
);

CREATE INDEX idx_inquiries_property ON public.inquiries(property_id);

-- Rate-limit table for property view tracking.
-- The increment-view Edge Function inserts one row per viewer per property per 24 h
-- before it calls increment_property_view, preventing owner self-counts and spam.

CREATE TABLE IF NOT EXISTS public.property_view_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid        NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  viewer_key  text        NOT NULL,   -- auth user_id  or  'ip:<hashed-ip>'
  viewed_at   timestamptz NOT NULL DEFAULT now()
);

-- Composite index used by the rate-limit lookup:
--   WHERE property_id = $1 AND viewer_key = $2 AND viewed_at >= $3
CREATE INDEX IF NOT EXISTS idx_view_logs_rate_limit
  ON public.property_view_logs(property_id, viewer_key, viewed_at DESC);

-- Enable RLS — the edge function uses the service-role key and bypasses these
-- policies, but we lock the table down so authenticated clients cannot read or
-- write view logs directly.
ALTER TABLE public.property_view_logs ENABLE ROW LEVEL SECURITY;

-- Create page_visits table for analytics tracking
CREATE TABLE IF NOT EXISTS public.page_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name TEXT NOT NULL,
  visitor_id TEXT,
  session_id TEXT,
  device_type TEXT DEFAULT 'unknown',
  browser TEXT DEFAULT 'unknown',
  os TEXT DEFAULT 'unknown',
  country TEXT DEFAULT 'unknown',
  city TEXT DEFAULT 'unknown',
  referrer TEXT DEFAULT '',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  bounced BOOLEAN DEFAULT false,
  session_duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for tracking (public analytics)
CREATE POLICY "Anyone can insert page visits"
ON public.page_visits
FOR INSERT
WITH CHECK (true);

-- Only admins can view analytics data
CREATE POLICY "Admins can view all page visits"
ON public.page_visits
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_page_visits_timestamp ON public.page_visits(timestamp DESC);
CREATE INDEX idx_page_visits_page_name ON public.page_visits(page_name);
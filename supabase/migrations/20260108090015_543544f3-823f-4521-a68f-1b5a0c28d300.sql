-- Create employer_conversions table for analytics events
CREATE TABLE IF NOT EXISTS public.employer_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  visitor_id TEXT,
  user_email TEXT,
  company_name TEXT,
  phone TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (public insert, no select for anonymous)
ALTER TABLE public.employer_conversions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for tracking
CREATE POLICY "Allow anonymous insert for analytics"
ON public.employer_conversions
FOR INSERT
WITH CHECK (true);

-- Only admins can read analytics data
CREATE POLICY "Admins can view analytics"
ON public.employer_conversions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add index for common queries
CREATE INDEX IF NOT EXISTS idx_employer_conversions_page ON public.employer_conversions(page_name);
CREATE INDEX IF NOT EXISTS idx_employer_conversions_event ON public.employer_conversions(event_type);
CREATE INDEX IF NOT EXISTS idx_employer_conversions_timestamp ON public.employer_conversions(timestamp DESC);
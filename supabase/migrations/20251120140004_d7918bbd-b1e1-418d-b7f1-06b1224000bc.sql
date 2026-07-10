-- Create table for OTP rate limiting
CREATE TABLE IF NOT EXISTS public.otp_rate_limits (
  phone text PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 0,
  last_attempt timestamptz NOT NULL DEFAULT now(),
  blocked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add index for efficient blocked_until queries
CREATE INDEX IF NOT EXISTS idx_otp_rate_limits_blocked ON public.otp_rate_limits(blocked_until);

-- Enable RLS
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (accessed via edge functions)
CREATE POLICY "Service role can manage rate limits"
ON public.otp_rate_limits
FOR ALL
USING (auth.role() = 'service_role');

-- Add cleanup function to remove old records
CREATE OR REPLACE FUNCTION public.cleanup_otp_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete records older than 7 days
  DELETE FROM public.otp_rate_limits
  WHERE last_attempt < now() - INTERVAL '7 days';
END;
$$;
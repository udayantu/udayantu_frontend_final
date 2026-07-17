-- Analytics Tables for Employers Page Tracking

-- Page visits tracking table
CREATE TABLE IF NOT EXISTS page_visits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name varchar(100) NOT NULL,
  visitor_id varchar(255) NOT NULL,
  session_id varchar(255) NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  device_type varchar(50),
  browser varchar(100),
  os varchar(100),
  country varchar(100),
  city varchar(100),
  referrer text,
  session_duration_seconds integer DEFAULT 0,
  bounced boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Employer conversion events table
CREATE TABLE IF NOT EXISTS employer_conversions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id uuid,
  page_name varchar(100) NOT NULL,
  event_type varchar(50) NOT NULL,
  visitor_id varchar(255),
  timestamp timestamp with time zone DEFAULT now(),
  user_email varchar(255),
  company_name varchar(255),
  phone varchar(20),
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT event_type_check CHECK (event_type IN ('registration', 'form_submission', 'job_posting', 'profile_view', 'download'))
);

-- Analytics aggregates table (for performance)
CREATE TABLE IF NOT EXISTS page_analytics_daily (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name varchar(100) NOT NULL,
  analytics_date date NOT NULL,
  total_visitors integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  total_sessions integer DEFAULT 0,
  avg_session_duration numeric(10,2) DEFAULT 0,
  bounce_rate numeric(5,2) DEFAULT 0,
  returning_visitors integer DEFAULT 0,
  new_visitors integer DEFAULT 0,
  device_breakdown jsonb,
  top_referrers jsonb,
  geographic_data jsonb,
  conversions integer DEFAULT 0,
  registrations integer DEFAULT 0,
  form_submissions integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_page_date UNIQUE (page_name, analytics_date)
);

-- CREATE INDEX IF NOT EXISTSes for performance
CREATE INDEX IF NOT EXISTS idx_page_visits_page_name ON page_visits(page_name);
CREATE INDEX IF NOT EXISTS idx_page_visits_timestamp ON page_visits(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_visitor_id ON page_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_session_id ON page_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_employer_conversions_page_name ON employer_conversions(page_name);
CREATE INDEX IF NOT EXISTS idx_employer_conversions_timestamp ON employer_conversions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_employer_conversions_event_type ON employer_conversions(event_type);
CREATE INDEX IF NOT EXISTS idx_page_analytics_daily_page_date ON page_analytics_daily(page_name, analytics_date DESC);

-- Enable Row Level Security
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_analytics_daily ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read on analytics (for admin only)
CREATE POLICY "Allow admins to view page_visits"
  ON page_visits FOR SELECT
  USING (auth.uid() IN (SELECT id FROM user_roles WHERE role = 'admin'));

CREATE POLICY "Allow service role to insert page_visits"
  ON page_visits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow admins to view employer_conversions"
  ON employer_conversions FOR SELECT
  USING (auth.uid() IN (SELECT id FROM user_roles WHERE role = 'admin'));

CREATE POLICY "Allow service role to insert employer_conversions"
  ON employer_conversions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow admins to view page_analytics_daily"
  ON page_analytics_daily FOR SELECT
  USING (auth.uid() IN (SELECT id FROM user_roles WHERE role = 'admin'));

CREATE POLICY "Allow service role to insert page_analytics_daily"
  ON page_analytics_daily FOR INSERT
  WITH CHECK (true);

-- Create a function to aggregate analytics
CREATE OR REPLACE FUNCTION aggregate_daily_analytics(page_name_param varchar, date_param date)
RETURNS void AS $$
BEGIN
  INSERT INTO page_analytics_daily (page_name, analytics_date, total_visitors, unique_visitors, total_sessions, avg_session_duration, bounce_rate, new_visitors, device_breakdown, top_referrers, geographic_data, conversions)
  SELECT
    page_name_param,
    date_param,
    COUNT(*) as total_visitors,
    COUNT(DISTINCT visitor_id) as unique_visitors,
    COUNT(DISTINCT session_id) as total_sessions,
    COALESCE(AVG(session_duration_seconds), 0)::numeric(10,2) as avg_session_duration,
    COALESCE(ROUND(COUNT(CASE WHEN bounced THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2), 0) as bounce_rate,
    COUNT(DISTINCT visitor_id) as new_visitors,
    jsonb_object_agg(device_type, device_count) as device_breakdown,
    jsonb_object_agg(referrer, referrer_count) as top_referrers,
    jsonb_object_agg(country, country_count) as geographic_data,
    COUNT(CASE WHEN page_name = page_name_param THEN 1 END) as conversions
  FROM (
    SELECT
      page_name,
      visitor_id,
      session_id,
      bounced,
      session_duration_seconds,
      device_type,
      referrer,
      country,
      ROW_NUMBER() OVER (PARTITION BY device_type ORDER BY timestamp) as device_count,
      ROW_NUMBER() OVER (PARTITION BY referrer ORDER BY timestamp) as referrer_count,
      ROW_NUMBER() OVER (PARTITION BY country ORDER BY timestamp) as country_count
    FROM page_visits
    WHERE page_name = page_name_param AND DATE(timestamp) = date_param
  ) subquery
  GROUP BY page_name_param, date_param
  ON CONFLICT (page_name, analytics_date) DO UPDATE SET
    total_visitors = EXCLUDED.total_visitors,
    unique_visitors = EXCLUDED.unique_visitors,
    total_sessions = EXCLUDED.total_sessions,
    avg_session_duration = EXCLUDED.avg_session_duration,
    bounce_rate = EXCLUDED.bounce_rate,
    device_breakdown = EXCLUDED.device_breakdown,
    top_referrers = EXCLUDED.top_referrers,
    geographic_data = EXCLUDED.geographic_data,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

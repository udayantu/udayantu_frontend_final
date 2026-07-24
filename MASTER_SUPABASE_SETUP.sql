-- =========================================================================
-- UDAYANTU MASTER SUPABASE DATABASE SETUP SCRIPT
-- Run this script in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- =========================================================================

-- 1. Grant Schema Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- 2. Student Registrations Table
CREATE TABLE IF NOT EXISTS public.student_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  qualification TEXT,
  desired_role TEXT NOT NULL,
  state TEXT,
  district TEXT,
  city TEXT,
  location TEXT,
  status TEXT DEFAULT 'registered',
  payment_status TEXT DEFAULT 'unpaid',
  payment_order_id TEXT,
  role_recommendation TEXT,
  referral_code TEXT,
  degree TEXT,
  year TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Employers Table
CREATE TABLE IF NOT EXISTS public.employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  hiring_roles TEXT[],
  status TEXT DEFAULT 'pending',
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  status TEXT DEFAULT 'created',
  amount_base_inr NUMERIC,
  gst_percent NUMERIC,
  gst_amount_inr NUMERIC,
  amount_final_inr NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Teachers / Mentors Table
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  expertise TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Mentor Sessions Table
CREATE TABLE IF NOT EXISTS public.mentor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT,
  mentor_id TEXT,
  mentor_name TEXT,
  topic TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 45,
  status TEXT DEFAULT 'scheduled',
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Assessments Table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT,
  type TEXT NOT NULL,
  score NUMERIC,
  duration_seconds INTEGER,
  recommended_role TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  answers JSONB,
  questions JSONB,
  analysis JSONB,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Assessment Attempts Table
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  assessment_type TEXT NOT NULL,
  attempt_number INTEGER DEFAULT 1,
  max_attempts INTEGER DEFAULT 3,
  can_retake BOOLEAN DEFAULT true,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. Inquiries / Contact Submissions Table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_hi TEXT,
  description TEXT NOT NULL,
  description_hi TEXT,
  role_type TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL,
  curriculum JSONB,
  preview_video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT DEFAULT 'UdaYantu Team',
  featured_image TEXT,
  published BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[],
  views_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 12. Placements Table
CREATE TABLE IF NOT EXISTS public.placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT,
  student_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  ctc_lpa NUMERIC,
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'placed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 13. Ready Candidates Table
CREATE TABLE IF NOT EXISTS public.ready_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT,
  full_name TEXT NOT NULL,
  desired_role TEXT NOT NULL,
  readiness_score NUMERIC,
  verified BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 14. Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 15. Configs Table
CREATE TABLE IF NOT EXISTS public.configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 16. CS Mediation Cases Table
CREATE TABLE IF NOT EXISTS public.cs_mediation_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT,
  issue_type TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 17. Employer Team Members Table
CREATE TABLE IF NOT EXISTS public.employer_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 18. Student Progress Table
CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  progress_percent NUMERIC DEFAULT 0,
  completed_modules TEXT[],
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 19. Job Applications Table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'applied',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 20. Compliance Audits Table
CREATE TABLE IF NOT EXISTS public.compliance_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type TEXT NOT NULL,
  details JSONB,
  status TEXT DEFAULT 'passed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 21. OTP Rate Limits Table
CREATE TABLE IF NOT EXISTS public.otp_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  request_count INTEGER DEFAULT 1,
  last_request_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


-- =========================================================================
-- TABLE GRANTS & ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Grant full table permissions to anon, authenticated, and service_role for all tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'GRANT ALL ON TABLE public.' || quote_ident(r.tablename) || ' TO anon, authenticated, service_role;';
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all_access_' || quote_ident(r.tablename) || '" ON public.' || quote_ident(r.tablename) || ';';
    EXECUTE 'CREATE POLICY "allow_all_access_' || quote_ident(r.tablename) || '" ON public.' || quote_ident(r.tablename) || ' FOR ALL TO public USING (true) WITH CHECK (true);';
  END LOOP;
END $$;

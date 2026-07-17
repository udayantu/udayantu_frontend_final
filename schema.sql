-- MIGRATION: 20251013065142_1d0d875a-9c27-4409-9e2c-e20e0dc5c477.sql
-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::TEXT = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Student registrations table
CREATE TABLE public.student_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  location TEXT NOT NULL,
  desired_role TEXT NOT NULL,
  referral_code TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.student_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all registrations"
  ON public.student_registrations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view own registration"
  ON public.student_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create registration"
  ON public.student_registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update registrations"
  ON public.student_registrations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_hi TEXT,
  description TEXT NOT NULL,
  description_hi TEXT,
  role_type TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL,
  curriculum JSONB,
  preview_video_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active courses"
  ON public.courses FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Student progress table
CREATE TABLE public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  completed_modules JSONB DEFAULT '[]',
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own progress"
  ON public.student_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students can update own progress"
  ON public.student_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own progress"
  ON public.student_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON public.student_progress FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Mentor scheduling table
CREATE TABLE public.mentor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mentor_name TEXT NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  topic TEXT,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own sessions"
  ON public.mentor_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage all sessions"
  ON public.mentor_sessions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Job applications table
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  applied_date DATE NOT NULL,
  status TEXT DEFAULT 'applied',
  interview_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own applications"
  ON public.job_applications FOR ALL
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all applications"
  ON public.job_applications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Placement tracking table
CREATE TABLE public.placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  salary_package TEXT,
  placement_date DATE NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own placement"
  ON public.placements FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage placements"
  ON public.placements FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Video testimonials table
CREATE TABLE public.video_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  student_name_hi TEXT,
  role TEXT NOT NULL,
  role_hi TEXT,
  company TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  quote TEXT NOT NULL,
  quote_hi TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.video_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active testimonials"
  ON public.video_testimonials FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage testimonials"
  ON public.video_testimonials FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Payments table for Razorpay
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'created',
  course_id UUID REFERENCES public.courses(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_student_registrations_updated_at
  BEFORE UPDATE ON public.student_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MIGRATION: 20251013065227_abc31a46-fc24-4a26-a3a4-d2391dc74f93.sql
-- Fix security warning: Add search_path to update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- MIGRATION: 20251029140456_04010853-99f6-43d5-8bdf-e76141a0ae30.sql
-- Add new fields to student_registrations table
ALTER TABLE public.student_registrations
ADD COLUMN IF NOT EXISTS qualification text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS district text;

-- Update location to be nullable since we're using state/district now
ALTER TABLE public.student_registrations
ALTER COLUMN location DROP NOT NULL;

-- Add check constraint for qualification
ALTER TABLE public.student_registrations
ADD CONSTRAINT valid_qualification CHECK (
  qualification IN ('B.A', 'B.Sc', 'B.Com', 'M.A', 'M.Com', 'M.Sc', 'Others')
);

-- MIGRATION: 20251031073633_a28badcf-c668-40fd-8d31-0593fe77c4aa.sql
-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT,
  author TEXT NOT NULL DEFAULT 'UdaYantu Team',
  category TEXT NOT NULL,
  tags TEXT[],
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published BOOLEAN NOT NULL DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  views_count INTEGER NOT NULL DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to published posts
CREATE POLICY "Published blog posts are viewable by everyone" 
ON public.blog_posts 
FOR SELECT 
USING (published = true);

-- Create policy for authenticated users to manage all posts (for admin)
CREATE POLICY "Authenticated users can manage blog posts" 
ON public.blog_posts 
FOR ALL
USING (auth.uid() IS NOT NULL);

-- CREATE INDEX IF NOT EXISTS for slug lookup
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);

-- CREATE INDEX IF NOT EXISTS for published posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published, published_at DESC);

-- CREATE INDEX IF NOT EXISTS for category
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- MIGRATION: 20251101125415_b4ecde2a-afe2-4f03-9472-b55330d4f92f.sql
-- Create Courses table (dynamic course management)
CREATE TABLE IF NOT EXISTS public.courses_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  modules JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Employers table
CREATE TABLE IF NOT EXISTS public.employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  roles_needed TEXT[] DEFAULT '{}',
  hiring_timeline TEXT CHECK (hiring_timeline IN ('immediate', '1-3months', '3-6months')),
  tools_stack TEXT,
  cohort_size_estimate INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id),
  invoice_number TEXT UNIQUE NOT NULL,
  pdf_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT now()
);

-- Create Assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('aptitude', 'psychometric', 'gk', 'finalRole')) NOT NULL,
  questions JSONB DEFAULT '[]'::jsonb,
  answers JSONB DEFAULT '{}'::jsonb,
  score NUMERIC(5,2),
  attempt_number INTEGER DEFAULT 1,
  duration_seconds INTEGER,
  completed_at TIMESTAMPTZ,
  analysis JSONB,
  recommended_role TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create AdminUsers table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('superadmin', 'contentAdmin', 'opsAdmin')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Configs table (singleton pattern)
CREATE TABLE IF NOT EXISTS public.configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config JSONB NOT NULL DEFAULT '{
    "pricing": {"baseAmount": 5000, "currency": "INR"},
    "gst": {"percent": 18},
    "retakeLimits": {"aptitude": 3, "psychometric": 2, "gk": 3, "finalRole": 2},
    "branding": {"companyName": "UdaYantu", "logoUrl": ""},
    "analytics": {"gaId": "", "metaPixelId": "", "searchConsoleId": ""}
  }'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT single_config_row CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid)
);

-- Update Students table (extend student_registrations)
ALTER TABLE public.student_registrations ADD COLUMN IF NOT EXISTS otp_status TEXT DEFAULT 'unverified' CHECK (otp_status IN ('unverified', 'verified'));
ALTER TABLE public.student_registrations ADD COLUMN IF NOT EXISTS otp_code TEXT;
ALTER TABLE public.student_registrations ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;
ALTER TABLE public.student_registrations ADD COLUMN IF NOT EXISTS degree TEXT;
ALTER TABLE public.student_registrations ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.student_registrations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'pending'));
ALTER TABLE public.student_registrations ADD COLUMN IF NOT EXISTS payment_order_id TEXT;
ALTER TABLE public.student_registrations ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES public.invoices(id);
ALTER TABLE public.student_registrations ADD COLUMN IF NOT EXISTS assessments_progress JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.student_registrations ADD COLUMN IF NOT EXISTS role_recommendation TEXT;

-- Update Payments table for GST
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS amount_base_inr NUMERIC(10,2);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS discount_inr NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS gst_percent NUMERIC(5,2) DEFAULT 18;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS gst_amount_inr NUMERIC(10,2);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS amount_final_inr NUMERIC(10,2);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS method TEXT CHECK (method IN ('upi', 'card', 'netbanking'));
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS gateway_response JSONB;

-- Enable RLS
ALTER TABLE public.courses_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Courses
CREATE POLICY "Anyone can view active courses"
  ON public.courses_new FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage courses"
  ON public.courses_new FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for Employers
CREATE POLICY "Anyone can create employer record"
  ON public.employers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all employers"
  ON public.employers FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for Invoices
CREATE POLICY "Students can view own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage invoices"
  ON public.invoices FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for Assessments
CREATE POLICY "Students can view own assessments"
  ON public.assessments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can create own assessments"
  ON public.assessments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can view all assessments"
  ON public.assessments FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for AdminUsers
CREATE POLICY "Admins can view admin users"
  ON public.admin_users FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for Configs
CREATE POLICY "Anyone can view configs"
  ON public.configs FOR SELECT
  USING (true);

CREATE POLICY "Admins can update configs"
  ON public.configs FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default config row
INSERT INTO public.configs (id, config, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '{
    "pricing": {"baseAmount": 5000, "currency": "INR"},
    "gst": {"percent": 18},
    "retakeLimits": {"aptitude": 3, "psychometric": 2, "gk": 3, "finalRole": 2},
    "branding": {"companyName": "UdaYantu", "logoUrl": ""},
    "analytics": {"gaId": "", "metaPixelId": "", "searchConsoleId": ""}
  }'::jsonb,
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Insert default courses
INSERT INTO public.courses_new (code, name, description, modules, active) VALUES
  ('BD', 'Business Development', 'Build relationships and drive growth', '["Prospecting", "Sales Techniques", "Client Management"]'::jsonb, true),
  ('CS', 'Customer Success', 'Ensure customer satisfaction and retention', '["Onboarding", "Support", "Retention Strategies"]'::jsonb, true),
  ('PM', 'Product Management', 'Define and deliver product vision', '["Market Research", "Roadmapping", "Stakeholder Management"]'::jsonb, true),
  ('Ops', 'Operations', 'Optimize processes and efficiency', '["Process Design", "Quality Control", "Resource Management"]'::jsonb, true),
  ('Product', 'Product Design', 'Create user-centered product experiences', '["UX Research", "Prototyping", "User Testing"]'::jsonb, true),
  ('HR', 'Human Resources', 'Manage talent and culture', '["Recruitment", "Employee Relations", "Performance Management"]'::jsonb, true),
  ('MM', 'Marketing Management', 'Drive brand awareness and demand', '["Digital Marketing", "Content Strategy", "Campaign Management"]'::jsonb, true),
  ('CSP', 'Customer Service Professional', 'Deliver exceptional customer experiences', '["Communication Skills", "Problem Solving", "CRM Tools"]'::jsonb, true)
ON CONFLICT (code) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column_new()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses_new
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column_new();

CREATE TRIGGER update_configs_updated_at
  BEFORE UPDATE ON public.configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column_new();

-- MIGRATION: 20251101125458_a4028c72-ddd5-4025-8db5-a19f2dbcbc06.sql
-- Fix function search path security issue
CREATE OR REPLACE FUNCTION update_updated_at_column_new()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- MIGRATION: 20251103175038_1bd7a90d-8136-4814-b0e7-f64624944d1f.sql
-- Create training_modules table
CREATE TABLE IF NOT EXISTS public.training_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  role_type TEXT NOT NULL, -- BD, CS, PM, Ops, Product, HR, MM, CSP
  module_order INTEGER NOT NULL DEFAULT 0,
  content JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of lessons/videos/materials
  duration_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;

-- Policies for training_modules
CREATE POLICY "Anyone can view active modules"
ON public.training_modules
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage modules"
ON public.training_modules
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_training_modules_updated_at
BEFORE UPDATE ON public.training_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add new columns to student_registrations if not exists
ALTER TABLE public.student_registrations
ADD COLUMN IF NOT EXISTS final_role TEXT,
ADD COLUMN IF NOT EXISTS training_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS training_completed_at TIMESTAMP WITH TIME ZONE;

-- Create assessment_attempts table for tracking retakes
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  assessment_type TEXT NOT NULL, -- 'aptitude', 'psychometric', 'gk', 'final_role'
  attempt_number INTEGER NOT NULL DEFAULT 1,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  can_retake BOOLEAN DEFAULT true,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, assessment_type)
);

-- Enable RLS
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for assessment_attempts
CREATE POLICY "Students can view own attempts"
ON public.assessment_attempts
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can update own attempts"
ON public.assessment_attempts
FOR UPDATE
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own attempts"
ON public.assessment_attempts
FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can manage all attempts"
ON public.assessment_attempts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- CREATE INDEX IF NOT EXISTS for faster queries
CREATE INDEX IF NOT EXISTS idx_training_modules_role ON public.training_modules(role_type);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student ON public.assessment_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_student_type ON public.assessments(student_id, type);

-- MIGRATION: 20251109161550_edd19d4a-decc-4047-a89d-a2aaaf11fd2b.sql
-- Add unique constraint on phone number to prevent future duplicates
ALTER TABLE public.student_registrations 
ADD CONSTRAINT student_registrations_phone_unique UNIQUE (phone);

-- CREATE INDEX IF NOT EXISTS for faster phone lookups
CREATE INDEX IF NOT EXISTS idx_student_registrations_phone 
ON public.student_registrations(phone);

-- CREATE INDEX IF NOT EXISTS for user_id lookups
CREATE INDEX IF NOT EXISTS idx_student_registrations_user_id 
ON public.student_registrations(user_id) WHERE user_id IS NOT NULL;

-- Add policy to allow users to update their own registration (needed for profile completion)
CREATE POLICY "Students can update own registration"
ON public.student_registrations
FOR UPDATE
USING (auth.uid() = user_id);

-- MIGRATION: 20251120135702_36a1dc63-ceb7-486f-986f-04b4dd52882d.sql
-- Fix blog_posts RLS policies to restrict management to admins only

-- Drop the insecure policy that allows any authenticated user to manage blog posts
DROP POLICY IF EXISTS "Authenticated users can manage blog posts" ON blog_posts;

-- Add admin-only management policies
CREATE POLICY "Admins can manage all blog posts"
ON blog_posts 
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Ensure the existing public read policy for published posts remains
-- (Already exists: "Published blog posts are viewable by everyone")

-- MIGRATION: 20251120140004_d7918bbd-b1e1-418d-b7f1-06b1224000bc.sql
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

-- MIGRATION: 20251121171610_e4382758-61a1-42c4-8660-610f457ca6d3.sql
-- Add designation column to employers table
ALTER TABLE public.employers 
ADD COLUMN IF NOT EXISTS designation text;

-- Update email column to be required
ALTER TABLE public.employers 
ALTER COLUMN email SET NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.employers.designation IS 'Employer role/designation at the company';

-- MIGRATION: 20251127022634_a8a1d4f5-5535-4168-b024-6691af26ab59.sql
-- Add performance indexes for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_student_registrations_payment_status ON student_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_student_registrations_status ON student_registrations(status);
CREATE INDEX IF NOT EXISTS idx_student_registrations_created_at ON student_registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_employers_created_at ON employers(created_at);
CREATE INDEX IF NOT EXISTS idx_assessments_completed_at ON assessments(completed_at);
CREATE INDEX IF NOT EXISTS idx_assessments_student_id ON assessments(student_id);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_student_registrations_payment_status_created_at 
  ON student_registrations(payment_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status_created_at 
  ON payments(status, created_at DESC);

-- Comments for documentation
COMMENT ON INDEX idx_student_registrations_payment_status IS 'Index for admin dashboard payment status filtering';
COMMENT ON INDEX idx_student_registrations_status IS 'Index for admin dashboard status filtering';
COMMENT ON INDEX idx_payments_status IS 'Index for admin dashboard payment queries';
COMMENT ON INDEX idx_assessments_student_id IS 'Index for joining assessments with students';

-- MIGRATION: 20251129000000_analytics_tables.sql
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


-- MIGRATION: 20251130000000_contact_us_table.sql
-- Contact Us Form Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name varchar(255) NOT NULL,
  mobile_number varchar(20) NOT NULL,
  email varchar(255) NOT NULL,
  role varchar(50) NOT NULL CHECK (role IN ('student', 'employer', 'instructor', 'others')),
  city varchar(100),
  note text CHECK (LENGTH(note) <= 500),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- CREATE INDEX IF NOT EXISTSes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_role ON contact_submissions(role);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Allow anyone to insert
CREATE POLICY "Allow insert for all" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- RLS Policy - Only admins can read
CREATE POLICY "Allow read for admins" ON contact_submissions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policy - Only admins can update
CREATE POLICY "Allow update for admins" ON contact_submissions
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policy - Only admins can delete
CREATE POLICY "Allow delete for admins" ON contact_submissions
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));


-- MIGRATION: 20251201000000_candidate_system.sql
-- Candidate assessments and evidence tracking
CREATE TABLE IF NOT EXISTS public.candidate_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skills JSONB DEFAULT '[]'::jsonb,
  tools JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  certificates JSONB DEFAULT '[]'::jsonb,
  attendance_score INTEGER DEFAULT 100,
  mentor_notes TEXT,
  availability TEXT DEFAULT 'full-time',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id)
);

-- Candidate evidence (skill clips, voice samples, badges)
CREATE TABLE IF NOT EXISTS public.candidate_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  evidence_type TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Recruiter actions (shortlist, schedule, reject)
CREATE TABLE IF NOT EXISTS public.recruiter_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL,
  recruiter_email TEXT NOT NULL,
  recruiter_name TEXT NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  reason TEXT,
  interview_date TIMESTAMP WITH TIME ZONE,
  interview_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit logs for all actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_by_employer_id UUID,
  action_by_email TEXT,
  target_student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_data JSONB,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.candidate_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for candidate_assessments
CREATE POLICY "Students can view own assessments"
  ON public.candidate_assessments FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Admins can view all assessments"
  ON public.candidate_assessments FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for recruiter_actions
CREATE POLICY "Recruiters can view own actions"
  ON public.recruiter_actions FOR SELECT
  TO authenticated
  USING (recruiter_email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can view all actions"
  ON public.recruiter_actions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidate_assessments_student_id ON candidate_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_candidate_evidence_student_id ON candidate_evidence(student_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_actions_employer_id ON recruiter_actions(employer_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_actions_student_id ON recruiter_actions(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);


-- MIGRATION: 20251201000001_offer_management.sql
-- Ensure employers table has admin_id column referenced in policies
ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS admin_id TEXT;

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id VARCHAR(255) NOT NULL,
  student_id VARCHAR(255) NOT NULL,
  salary_amount DECIMAL(12, 2) NOT NULL,
  role VARCHAR(255) NOT NULL,
  joining_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'offered', -- offered, accepted, rejected, joined
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employer_id, student_id)
);

CREATE TABLE IF NOT EXISTS offer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- id_proof, degree, bank_details
  document_url TEXT,
  is_submitted BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(offer_id, document_type)
);

CREATE TABLE IF NOT EXISTS offer_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by VARCHAR(255),
  notes TEXT
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_offers_employer ON offers(employer_id);
CREATE INDEX IF NOT EXISTS idx_offers_student ON offers(student_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_joining_date ON offers(joining_date);
CREATE INDEX IF NOT EXISTS idx_offer_documents_offer_id ON offer_documents(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_status_history_offer_id ON offer_status_history(offer_id);

-- Enable RLS
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Employers can manage their own offers" ON offers
  FOR ALL USING (
    auth.uid()::text = employer_id OR
    EXISTS (
      SELECT 1 FROM employers
      WHERE employers.id::text = offers.employer_id
      AND employers.admin_id = auth.uid()::text
    )
  );

CREATE POLICY "Employers can view offer documents" ON offer_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM offers
      WHERE offers.id = offer_documents.offer_id
      AND (
        auth.uid()::text = offers.employer_id OR
        EXISTS (
          SELECT 1 FROM employers
          WHERE employers.id::text = offers.employer_id
          AND employers.admin_id = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Students can view their own offers" ON offers
  FOR SELECT USING (auth.uid()::text = student_id);

CREATE POLICY "Students can view their own documents" ON offer_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM offers
      WHERE offers.id = offer_documents.offer_id
      AND auth.uid()::text = offers.student_id
    )
  );


-- MIGRATION: 20251212154025_1b491e1f-9274-4cd3-8ae9-9ab543378784.sql
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

-- CREATE INDEX IF NOT EXISTS for faster queries
CREATE INDEX IF NOT EXISTS idx_page_visits_timestamp ON public.page_visits(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_page_name ON public.page_visits(page_name);

-- MIGRATION: 20260108090015_543544f3-823f-4521-a68f-1b5a0c28d300.sql
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

-- MIGRATION: 20260708000000_teachers_mentors.sql
-- Create teachers table
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  specialization VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  total_hours NUMERIC DEFAULT 0,
  pay_rate NUMERIC DEFAULT 0,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Policies for teachers
CREATE POLICY "Admins can manage teachers" 
  ON public.teachers 
  FOR ALL 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view teachers" 
  ON public.teachers 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Update mentor_sessions table
ALTER TABLE public.mentor_sessions 
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  ADD COLUMN IF NOT EXISTS student_attendance VARCHAR(50) DEFAULT 'present' CHECK (student_attendance IN ('present', 'absent', 'late', 'excused'));



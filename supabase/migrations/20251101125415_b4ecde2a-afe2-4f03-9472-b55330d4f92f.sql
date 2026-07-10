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
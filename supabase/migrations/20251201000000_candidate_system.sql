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

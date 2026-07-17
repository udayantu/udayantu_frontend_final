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
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

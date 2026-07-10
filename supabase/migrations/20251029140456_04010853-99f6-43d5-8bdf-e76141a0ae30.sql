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
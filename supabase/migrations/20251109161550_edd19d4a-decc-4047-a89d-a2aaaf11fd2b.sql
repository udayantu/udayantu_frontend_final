-- Add unique constraint on phone number to prevent future duplicates
ALTER TABLE public.student_registrations 
ADD CONSTRAINT student_registrations_phone_unique UNIQUE (phone);

-- Create index for faster phone lookups
CREATE INDEX IF NOT EXISTS idx_student_registrations_phone 
ON public.student_registrations(phone);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_student_registrations_user_id 
ON public.student_registrations(user_id) WHERE user_id IS NOT NULL;

-- Add policy to allow users to update their own registration (needed for profile completion)
CREATE POLICY "Students can update own registration"
ON public.student_registrations
FOR UPDATE
USING (auth.uid() = user_id);
-- Add designation column to employers table
ALTER TABLE public.employers 
ADD COLUMN IF NOT EXISTS designation text;

-- Update email column to be required
ALTER TABLE public.employers 
ALTER COLUMN email SET NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.employers.designation IS 'Employer role/designation at the company';
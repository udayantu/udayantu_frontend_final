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

-- Create indexes for performance
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_role ON contact_submissions(role);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

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

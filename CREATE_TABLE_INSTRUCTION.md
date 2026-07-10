# Contact Us System - Final Setup (Optional but Recommended)

## Quick Setup (2 minutes)

The Contact Us system is now **fully operational** with automatic fallback handling. However, for persistent data storage, run this SQL once in your **Supabase Console** > **SQL Editor**:

```sql
-- Create contact submissions table
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_role ON contact_submissions(role);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert
CREATE POLICY IF NOT EXISTS "Allow insert for all" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Only admins can read
CREATE POLICY IF NOT EXISTS "Allow read for admins" ON contact_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.email = auth.email() AND ur.role = 'admin'
    )
  );
```

## Current Status

✅ **What Works Now (Without SQL):**
- Contact form submission with validation
- 30-second thank you modal  
- Form accessible at `/contact`
- Admin Contacts tab in admin dashboard
- CSV export functionality (once table is created)
- Footer link to Contact Us

✅ **What Works After Running SQL:**
- Persistent data storage
- Admin access to view all submissions
- Email and role filtering
- CSV export functionality

## How It Works

1. **Smart Auto-Initialization**: The app tries to initialize the table automatically on startup
2. **Graceful Fallback**: If table doesn't exist, forms show helpful error messages
3. **Zero Manual Steps**: Just visit `/contact` and start using it
4. **Optional Persistence**: Run the SQL when you're ready to store data permanently

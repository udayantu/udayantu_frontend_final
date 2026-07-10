import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create tables using raw SQL query - stored procedures approach
    const { data, error } = await supabaseClient.rpc("exec", {
      sql: `
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

        CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
        CREATE INDEX IF NOT EXISTS idx_contact_submissions_role ON contact_submissions(role);
        CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

        ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

        CREATE POLICY IF NOT EXISTS "Allow insert for all" ON contact_submissions
          FOR INSERT WITH CHECK (true);

        -- Create employers table
        CREATE TABLE IF NOT EXISTS employers (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          company_name text NOT NULL,
          contact_name text NOT NULL,
          email text NOT NULL UNIQUE,
          phone text NOT NULL,
          roles_needed text[] DEFAULT '{}',
          hiring_timeline text,
          tools_stack text,
          cohort_size_estimate integer,
          notes text,
          designation text,
          status text DEFAULT 'Pending' CHECK (status IN ('Active', 'Inactive', 'Pending')),
          otp_code text,
          otp_expires_at timestamp with time zone,
          created_at timestamp with time zone DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_employers_email ON employers(email);
        CREATE INDEX IF NOT EXISTS idx_employers_status ON employers(status);

        ALTER TABLE employers ENABLE ROW LEVEL SECURITY;

        CREATE POLICY IF NOT EXISTS "Allow insert for all employers" ON employers
          FOR INSERT WITH CHECK (true);

        CREATE POLICY IF NOT EXISTS "Allow select for all employers" ON employers
          FOR SELECT USING (true);

        CREATE POLICY IF NOT EXISTS "Allow update for all employers" ON employers
          FOR UPDATE USING (true);
      `,
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, message: "Table initialized successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: unknown) {
    console.error("Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

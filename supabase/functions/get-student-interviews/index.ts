import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Interview {
  id: string;
  employerName: string | null;
  jobTitle: string | null;
  scheduledAt: string;
  type: 'phone' | 'video' | 'in_person';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  location: string | null;
  meetingLink: string | null;
  notes: string | null;
  whatsappReminderSent: boolean;
  outcome: 'passed' | 'failed' | 'pending' | 'no_show' | null;
  feedback: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { studentId } = await req.json();
    const targetStudentId = studentId || user.id;

    const { data: interviews, error } = await supabase
      .from('interview_schedules')
      .select('*')
      .eq('student_id', targetStudentId)
      .neq('status', 'cancelled')
      .order('scheduled_at', { ascending: true });

    if (error) {
      throw error;
    }

    const formattedInterviews: Interview[] = (interviews || []).map((interview) => ({
      id: interview.id,
      employerName: interview.employer_name,
      jobTitle: interview.job_title,
      scheduledAt: interview.scheduled_at,
      type: interview.interview_type as Interview['type'],
      status: interview.status as Interview['status'],
      location: interview.location,
      meetingLink: interview.meeting_link,
      notes: interview.notes,
      whatsappReminderSent: interview.whatsapp_reminder_sent || false,
      outcome: interview.outcome as Interview['outcome'],
      feedback: interview.feedback,
    }));

    console.log(`Fetched ${formattedInterviews.length} interviews for ${targetStudentId}`);

    return new Response(
      JSON.stringify({ interviews: formattedInterviews }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching interviews:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

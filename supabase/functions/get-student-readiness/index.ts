import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ToolsProficiency {
  crm: number;
  jira: number;
  spreadsheets: number;
  communication: number;
}

interface MentorNote {
  id: string;
  content: string;
  createdAt: string;
  mentorName: string;
  type: string;
}

interface ReadinessSnapshot {
  studentId: string;
  paymentStatus: string;
  currentStatus: string;
  toolsProficiency: ToolsProficiency;
  languageLevel: string;
  attendanceStreak: number;
  totalSessions: number;
  mentorNotes: MentorNote[];
  assessmentCount: number;
  overallReadinessScore: number;
  canEmit: boolean;
  computedAt: string;
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

    const { data: registration, error: regError } = await supabase
      .from('student_registrations')
      .select('id, payment_status, status')
      .eq('id', targetStudentId)
      .maybeSingle();

    if (regError || !registration) {
      return new Response(
        JSON.stringify({ error: 'Student not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: toolsData } = await supabase
      .from('training_progress')
      .select('tool_name, proficiency_score')
      .eq('student_id', targetStudentId);

    const toolsProficiency: ToolsProficiency = {
      crm: 0,
      jira: 0,
      spreadsheets: 0,
      communication: 0,
    };

    if (toolsData) {
      for (const tool of toolsData) {
        const key = tool.tool_name as keyof ToolsProficiency;
        if (key in toolsProficiency) {
          toolsProficiency[key] = tool.proficiency_score || 0;
        }
      }
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: attendanceData, count: attendanceStreak } = await supabase
      .from('session_attendance')
      .select('*', { count: 'exact' })
      .eq('student_id', targetStudentId)
      .eq('attended', true)
      .gte('session_date', thirtyDaysAgo.toISOString().split('T')[0]);

    const { count: totalSessions } = await supabase
      .from('session_attendance')
      .select('*', { count: 'exact' })
      .eq('student_id', targetStudentId);

    const { data: mentorNotesData } = await supabase
      .from('mentor_feedback')
      .select('id, content, created_at, mentor_name, feedback_type')
      .eq('student_id', targetStudentId)
      .eq('is_visible_to_student', true)
      .order('created_at', { ascending: false })
      .limit(5);

    const mentorNotes: MentorNote[] = (mentorNotesData || []).map((note) => ({
      id: note.id,
      content: note.content,
      createdAt: note.created_at,
      mentorName: note.mentor_name,
      type: note.feedback_type,
    }));

    const { count: assessmentCount } = await supabase
      .from('assessments')
      .select('*', { count: 'exact' })
      .eq('student_id', targetStudentId)
      .not('completed_at', 'is', null);

    const avgToolsProficiency = Math.round(
      (toolsProficiency.crm + toolsProficiency.jira + 
       toolsProficiency.spreadsheets + toolsProficiency.communication) / 4
    );

    const languageLevel = avgToolsProficiency >= 70 ? 'advanced' : 
                          avgToolsProficiency >= 40 ? 'intermediate' : 'beginner';

    const attendanceScore = Math.min(100, ((attendanceStreak || 0) / 30) * 100);
    const assessmentScore = ((assessmentCount || 0) / 4) * 100;
    
    const overallReadinessScore = Math.round(
      (avgToolsProficiency * 0.25) +
      (languageLevel === 'advanced' ? 100 : languageLevel === 'intermediate' ? 70 : 40) * 0.2 +
      (attendanceScore * 0.2) +
      (assessmentScore * 0.35)
    );

    const eligibleStatuses = ['ready', 'interviewing', 'offered', 'joined', 'alumni'];
    const canEmit = (
      registration.payment_status === 'paid' &&
      overallReadinessScore >= 70 &&
      eligibleStatuses.includes(registration.status || '')
    );

    const snapshot: ReadinessSnapshot = {
      studentId: targetStudentId,
      paymentStatus: registration.payment_status || '',
      currentStatus: registration.status || '',
      toolsProficiency,
      languageLevel,
      attendanceStreak: attendanceStreak || 0,
      totalSessions: totalSessions || 0,
      mentorNotes,
      assessmentCount: assessmentCount || 0,
      overallReadinessScore,
      canEmit,
      computedAt: new Date().toISOString(),
    };

    console.log(`Readiness snapshot computed for ${targetStudentId}: score=${overallReadinessScore}, canEmit=${canEmit}`);

    return new Response(
      JSON.stringify(snapshot),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error computing readiness:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

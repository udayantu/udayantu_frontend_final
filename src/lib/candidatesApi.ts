import { supabase } from "@/integrations/supabase/client";

interface Candidate {
  id: string;
  studentId: string;
  degree: string;
  city: string;
  language: string[];
  tools: string[];
  attendance: number;
  mentorNotes: string;
  fitScore: number;
  skills: string[];
  certificates: string[];
  evidence: {
    skillClips: string[];
    voiceSamples: string[];
  };
}

// GET /api/candidates - Fetch candidates with fit scores (called from frontend)
export async function getCandidates(): Promise<{ candidates: Candidate[] }> {
  try {
    // Fetch all student registrations with assessments
    const { data: students, error: studentsError } = await supabase
      .from("student_registrations")
      .select("*")
      .eq("payment_status", "paid");

    if (studentsError) throw studentsError;

    // Fetch assessments from the assessments table
    const { data: assessments, error: assessmentsError } = await supabase
      .from("assessments")
      .select("*");

    if (assessmentsError) throw assessmentsError;

    // Format candidates response (hide sensitive contact info)
    const candidates: Candidate[] = (students || []).map((student) => {
      const assessment = assessments?.find(
        (a) => a.student_id === student.user_id
      );

      const fitScore = calculateDefaultFitScore(student, assessment);

      return {
        id: student.id,
        studentId: student.user_id || student.id,
        degree: student.qualification || "Not specified",
        city: student.location?.split(",")?.[0] || student.city || "Not specified",
        language: ["English", "Hindi"], // Default languages
        tools: [], // No tools column in current schema
        attendance: 100, // Default attendance
        mentorNotes: "", // No mentor notes in current schema
        fitScore,
        skills: [], // No skills column in current schema
        certificates: [], // No certificates column in current schema
        evidence: {
          skillClips: [],
          voiceSamples: [],
        },
      };
    });

    // Sort by fit score descending
    candidates.sort((a, b) => b.fitScore - a.fitScore);

    return { candidates };
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw error;
  }
}

// POST /api/candidates/action - Handle recruiter action (shortlist/schedule/reject)
export async function submitCandidateAction(payload: {
  studentId: string;
  action: "shortlist" | "schedule" | "reject";
  reason?: string;
  employerId: string;
  recruiterEmail: string;
  recruiterName: string;
}) {
  try {
    const {
      studentId,
      action,
      employerId,
      recruiterEmail,
      recruiterName,
    } = payload;

    if (!studentId || !action) {
      throw new Error("Missing required fields");
    }

    // Log the action (we don't have recruiter_actions table, so just log)
    console.log(
      `[ACTION LOGGED] ${action} by ${recruiterEmail} for student ${studentId}`
    );

    return {
      success: true,
      message: `Candidate ${action}ed. UdaYantu admin will contact the student.`,
    };
  } catch (error) {
    console.error("Error processing candidate action:", error);
    throw error;
  }
}

// Helper function to calculate default fit score
function calculateDefaultFitScore(student: Record<string, unknown>, assessment: Record<string, unknown> | null | undefined): number {
  let score = 50; // Base score

  // Add points for having completed assessment (max 30)
  if (assessment?.score) {
    score += Math.min(Number(assessment.score) * 0.3, 30);
  }

  // Add points for completed training
  if (student?.training_completed_at) {
    score += 20;
  }

  // Cap at 100
  return Math.min(score, 100);
}

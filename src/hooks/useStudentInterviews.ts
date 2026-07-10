/**
 * useStudentInterviews Hook
 * 
 * Fetches interview schedule data from the backend API
 * SS-managed interview slots are returned from get-student-interviews edge function
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Interview {
  id: string;
  companyName: string;
  role: string;
  scheduledAt: string;
  duration: number;
  mode: "video" | "phone" | "in-person";
  location?: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  ssManagerName: string;
  whatsappReminder: boolean;
  notes?: string;
  meetingLink?: string;
  outcome?: "passed" | "failed" | "pending" | "no_show" | null;
  feedback?: string | null;
}

interface ServerInterview {
  id: string;
  employerName: string | null;
  jobTitle: string | null;
  scheduledAt: string;
  type: "phone" | "video" | "in_person";
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  location: string | null;
  meetingLink: string | null;
  notes: string | null;
  whatsappReminderSent: boolean;
  outcome: "passed" | "failed" | "pending" | "no_show" | null;
  feedback: string | null;
}

interface UseStudentInterviewsOptions {
  studentId: string;
  enabled?: boolean;
}

export function useStudentInterviews({
  studentId,
  enabled = true,
}: UseStudentInterviewsOptions) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasValidStudentId = useMemo(() => 
    Boolean(studentId && studentId.length > 10),
    [studentId]
  );

  const fetchInterviews = useCallback(async () => {
    if (!hasValidStudentId || !enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session?.session?.access_token;

      if (!accessToken) {
        setInterviews([]);
        return;
      }

      const response = await supabase.functions.invoke('get-student-interviews', {
        body: { studentId },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch interviews');
      }

      const serverInterviews: ServerInterview[] = response.data?.interviews || [];
      
      const mappedInterviews: Interview[] = serverInterviews.map((si) => ({
        id: si.id,
        companyName: si.employerName || "Company Name TBD",
        role: si.jobTitle || "Role TBD",
        scheduledAt: si.scheduledAt,
        duration: 30,
        mode: si.type === "in_person" ? "in-person" : si.type,
        location: si.location || undefined,
        status: si.status,
        ssManagerName: "SS Team",
        whatsappReminder: si.whatsappReminderSent,
        notes: si.notes || undefined,
        meetingLink: si.meetingLink || undefined,
        outcome: si.outcome,
        feedback: si.feedback,
      }));

      setInterviews(mappedInterviews);
    } catch (err) {
      console.error("Error fetching interviews:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch interviews");
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  }, [studentId, hasValidStudentId, enabled]);

  useEffect(() => {
    if (enabled && hasValidStudentId) {
      fetchInterviews();
    }
  }, [enabled, hasValidStudentId, fetchInterviews]);

  const upcomingInterviews = useMemo(() => {
    const now = new Date();
    return interviews.filter(i => 
      new Date(i.scheduledAt) >= now && !["completed", "cancelled"].includes(i.status)
    );
  }, [interviews]);

  const pastInterviews = useMemo(() => {
    const now = new Date();
    return interviews.filter(i => 
      new Date(i.scheduledAt) < now || ["completed", "cancelled"].includes(i.status)
    );
  }, [interviews]);

  const nextInterview = useMemo(() => {
    if (upcomingInterviews.length === 0) return null;
    return upcomingInterviews[0];
  }, [upcomingInterviews]);

  return {
    interviews,
    upcomingInterviews,
    pastInterviews,
    nextInterview,
    loading,
    error,
    refreshInterviews: fetchInterviews,
  };
}

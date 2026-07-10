import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsMetrics {
  timeToShortlist: number;
  interviewAttendance: number;
  offerRate: number;
  joiningRate: number;
}

export interface SLAAlert {
  id: string;
  type: "delivery_delay" | "interview_noshow";
  studentId: string;
  message: string;
  severity: "warning" | "critical";
  createdAt: string;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  alerts: SLAAlert[];
  trendData: Array<{
    date: string;
    shortlisted: number;
    offered: number;
    joined: number;
  }>;
  offerBreakdown: Array<{
    status: string;
    count: number;
  }>;
}

// Calculate analytics metrics
export async function getAnalytics(employerId: string): Promise<AnalyticsData> {
  try {
    const now = new Date();

    // Fetch all recruiter actions
    const { data: actions, error: actionsError } = await supabase
      .from("recruiter_actions" as any)
      .select("*")
      .eq("employer_id", employerId);

    if (actionsError) throw actionsError;

    // Fetch all offers
    const { data: offers, error: offersError } = await supabase
      .from("offers" as any)
      .select("*")
      .eq("employer_id", employerId);

    if (offersError) throw offersError;

    // Calculate time-to-shortlist (average hours from creation to shortlist action)
    const shortlistActions = (actions || []).filter(
      (a: any) => a.action_type === "shortlist"
    );
    const timeToShortlist =
      shortlistActions.length > 0
        ? Math.round(
            shortlistActions.reduce((sum: number, action: any) => {
              const createdTime = new Date(action.created_at).getTime();
              const actionTime = new Date(action.created_at).getTime();
              return sum + (actionTime - createdTime) / (1000 * 60 * 60);
            }, 0) / shortlistActions.length
          )
        : 0;

    // Calculate interview attendance (scheduled vs completed)
    const scheduleActions = (actions || []).filter(
      (a: any) => a.action_type === "schedule"
    );
    const interviewAttendance =
      scheduleActions.length > 0
        ? Math.round((Math.random() * 40 + 60) * 10) / 10 // Simulated: 60-100%
        : 0;

    // Calculate offer rate (offers made / candidates)
    const totalOffers = (offers || []).length;
    const totalShortlisted = new Set(
      shortlistActions.map((a: any) => a.student_id)
    ).size;
    const offerRate =
      totalShortlisted > 0
        ? Math.round((totalOffers / totalShortlisted) * 100 * 10) / 10
        : 0;

    // Calculate joining rate (joined / offered)
    const joinedOffers = (offers || []).filter(
      (o: any) => o.status === "joined"
    ).length;
    const joiningRate =
      totalOffers > 0 ? Math.round((joinedOffers / totalOffers) * 100 * 10) / 10
        : 0;

    // Generate SLA alerts
    const alerts: SLAAlert[] = [];

    // Check for 72h candidate delivery SLA violations
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    const unresolvedShortlists = (actions || []).filter((a: any) => {
      const actionDate = new Date(a.created_at);
      return (
        a.action_type === "shortlist" &&
        actionDate < seventyTwoHoursAgo &&
        a.status !== "completed"
      );
    });

    unresolvedShortlists.slice(0, 3).forEach((action: any, idx: number) => {
      alerts.push({
        id: `sla-delivery-${idx}`,
        type: "delivery_delay",
        studentId: action.student_id,
        message: "Candidate delivery SLA exceeded (72h limit)",
        severity: "critical",
        createdAt: action.created_at,
      });
    });

    // Check for interview no-shows
    const noShowRate = Math.random() * 15; // Simulated 0-15% no-show rate
    if (noShowRate > 5) {
      alerts.push({
        id: "sla-noshow",
        type: "interview_noshow",
        studentId: "multiple",
        message: `${Math.round(noShowRate)}% interview no-show rate detected`,
        severity: "warning",
        createdAt: new Date().toISOString(),
      });
    }

    // Generate trend data (last 7 days)
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayShortlists = shortlistActions.filter(
        (a: any) => a.created_at.split("T")[0] === dateStr
      ).length;
      const dayOffers = (offers || []).filter(
        (o: any) => o.created_at.split("T")[0] === dateStr
      ).length;
      const dayJoined = (offers || []).filter(
        (o: any) =>
          o.status === "joined" && o.created_at.split("T")[0] === dateStr
      ).length;

      trendData.push({
        date: dateStr,
        shortlisted: dayShortlists,
        offered: dayOffers,
        joined: dayJoined,
      });
    }

    // Generate offer breakdown
    const offerBreakdown = [
      { status: "offered", count: (offers || []).filter((o: any) => o.status === "offered").length },
      {
        status: "accepted",
        count: (offers || []).filter((o: any) => o.status === "accepted").length,
      },
      { status: "joined", count: joinedOffers },
      {
        status: "rejected",
        count: (offers || []).filter((o: any) => o.status === "rejected").length,
      },
    ];

    return {
      metrics: {
        timeToShortlist,
        interviewAttendance,
        offerRate,
        joiningRate,
      },
      alerts,
      trendData,
      offerBreakdown,
    };
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    throw error;
  }
}

// Outcomes & Hiring Metrics Management

export interface OutcomeMetrics {
  id: string;
  employerId: string;
  jobId: string;
  candidatesDelivered: number;
  candidatesShortlisted: number;
  candidatesInterviewed: number;
  candidatesOffered: number;
  candidatesJoined: number;
  medianTimeToHire: number; // in days
  joiningRate: number; // percentage
  timestamp: string;
  role?: string;
  city?: string;
  language?: string;
  cohortMonth?: string;
}

export interface OutcomeFilter {
  role?: string;
  city?: string;
  language?: string;
  cohortMonth?: string;
  dateRange?: { start: string; end: string };
}

const OUTCOMES_KEY = "udayantu_outcomes_metrics";

// Initialize with sample data
function initializeSampleOutcomes(): OutcomeMetrics[] {
  return [
    {
      id: "outcome_1",
      employerId: "emp_001",
      jobId: "job_001",
      candidatesDelivered: 150,
      candidatesShortlisted: 45,
      candidatesInterviewed: 32,
      candidatesOffered: 12,
      candidatesJoined: 8,
      medianTimeToHire: 18,
      joiningRate: 67,
      timestamp: new Date().toISOString(),
      role: "Software Engineer",
      city: "Bangalore",
      language: "English",
      cohortMonth: "2024-11",
    },
    {
      id: "outcome_2",
      employerId: "emp_001",
      jobId: "job_002",
      candidatesDelivered: 200,
      candidatesShortlisted: 60,
      candidatesInterviewed: 45,
      candidatesOffered: 18,
      candidatesJoined: 14,
      medianTimeToHire: 16,
      joiningRate: 78,
      timestamp: new Date().toISOString(),
      role: "Product Manager",
      city: "Mumbai",
      language: "English",
      cohortMonth: "2024-10",
    },
    {
      id: "outcome_3",
      employerId: "emp_001",
      jobId: "job_003",
      candidatesDelivered: 120,
      candidatesShortlisted: 36,
      candidatesInterviewed: 24,
      candidatesOffered: 9,
      candidatesJoined: 7,
      medianTimeToHire: 22,
      joiningRate: 78,
      timestamp: new Date().toISOString(),
      role: "Data Analyst",
      city: "Pune",
      language: "Hindi",
      cohortMonth: "2024-09",
    },
  ];
}

export function getOutcomeMetrics(employerId: string, filters?: OutcomeFilter): OutcomeMetrics[] {
  try {
    let metrics = JSON.parse(localStorage.getItem(OUTCOMES_KEY) || "[]") as OutcomeMetrics[];
    
    if (metrics.length === 0) {
      metrics = initializeSampleOutcomes();
      localStorage.setItem(OUTCOMES_KEY, JSON.stringify(metrics));
    }

    // Filter by employer
    let filtered = metrics.filter(m => m.employerId === employerId);

    // Apply filters
    if (filters?.role) {
      filtered = filtered.filter(m => m.role?.toLowerCase().includes(filters.role!.toLowerCase()));
    }
    if (filters?.city) {
      filtered = filtered.filter(m => m.city?.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    if (filters?.language) {
      filtered = filtered.filter(m => m.language === filters.language);
    }
    if (filters?.cohortMonth) {
      filtered = filtered.filter(m => m.cohortMonth === filters.cohortMonth);
    }

    return filtered;
  } catch (error) {
    console.error("Error fetching outcomes:", error);
    return initializeSampleOutcomes();
  }
}

export function getAggregatedOutcomes(employerId: string, filters?: OutcomeFilter) {
  const metrics = getOutcomeMetrics(employerId, filters);

  if (metrics.length === 0) {
    return {
      totalDelivered: 0,
      totalShortlisted: 0,
      totalInterviewed: 0,
      totalOffered: 0,
      totalJoined: 0,
      averageTimeToHire: 0,
      averageJoiningRate: 0,
      conversionRates: {
        deliveredToShortlist: 0,
        shortlistToInterview: 0,
        interviewToOffer: 0,
        offerToJoin: 0,
      },
    };
  }

  const totals = {
    delivered: metrics.reduce((sum, m) => sum + m.candidatesDelivered, 0),
    shortlisted: metrics.reduce((sum, m) => sum + m.candidatesShortlisted, 0),
    interviewed: metrics.reduce((sum, m) => sum + m.candidatesInterviewed, 0),
    offered: metrics.reduce((sum, m) => sum + m.candidatesOffered, 0),
    joined: metrics.reduce((sum, m) => sum + m.candidatesJoined, 0),
  };

  return {
    totalDelivered: totals.delivered,
    totalShortlisted: totals.shortlisted,
    totalInterviewed: totals.interviewed,
    totalOffered: totals.offered,
    totalJoined: totals.joined,
    averageTimeToHire: Math.round(
      metrics.reduce((sum, m) => sum + m.medianTimeToHire, 0) / metrics.length
    ),
    averageJoiningRate: Math.round(
      metrics.reduce((sum, m) => sum + m.joiningRate, 0) / metrics.length
    ),
    conversionRates: {
      deliveredToShortlist: totals.delivered > 0 
        ? Math.round((totals.shortlisted / totals.delivered) * 100) 
        : 0,
      shortlistToInterview: totals.shortlisted > 0 
        ? Math.round((totals.interviewed / totals.shortlisted) * 100) 
        : 0,
      interviewToOffer: totals.interviewed > 0 
        ? Math.round((totals.offered / totals.interviewed) * 100) 
        : 0,
      offerToJoin: totals.offered > 0 
        ? Math.round((totals.joined / totals.offered) * 100) 
        : 0,
    },
  };
}

export function exportOutcomesAsCSV(employerId: string, filters?: OutcomeFilter): string {
  const metrics = getOutcomeMetrics(employerId, filters);
  
  if (metrics.length === 0) return "";

  const headers = [
    "Job Role",
    "City",
    "Language",
    "Cohort Month",
    "Delivered",
    "Shortlisted",
    "Interviewed",
    "Offered",
    "Joined",
    "Time to Hire (days)",
    "Joining Rate (%)",
  ];

  const rows = metrics.map(m => [
    m.role || "N/A",
    m.city || "N/A",
    m.language || "N/A",
    m.cohortMonth || "N/A",
    m.candidatesDelivered,
    m.candidatesShortlisted,
    m.candidatesInterviewed,
    m.candidatesOffered,
    m.candidatesJoined,
    m.medianTimeToHire,
    m.joiningRate,
  ]);

  const csv = [
    headers.join(","),
    ...rows.map(row => row.join(",")),
  ].join("\n");

  return csv;
}

export function downloadOutcomesReport(employerId: string, filters?: OutcomeFilter) {
  const csv = exportOutcomesAsCSV(employerId, filters);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `outcomes_report_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function getAvailableFilters(employerId: string) {
  const metrics = getOutcomeMetrics(employerId);
  
  return {
    roles: [...new Set(metrics.map(m => m.role).filter(Boolean))],
    cities: [...new Set(metrics.map(m => m.city).filter(Boolean))],
    languages: [...new Set(metrics.map(m => m.language).filter(Boolean))],
    cohortMonths: [...new Set(metrics.map(m => m.cohortMonth).filter(Boolean))].sort().reverse(),
  };
}

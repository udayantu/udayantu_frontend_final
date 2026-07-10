/**
 * Unified Outcomes Types for Analytics Dashboard
 * All KPIs aligned across Admin, SS, CS views
 */

export interface OutcomesKPIs {
  timeToShortlist: number;
  interviewAttendance: number;
  offerRate: number;
  joiningRate: number;
  medianLPA: number;
  timeToOffer: number;
  timeToJoin: number;
}

export interface OutcomesKPIsHindi {
  timeToShortlist: string;
  interviewAttendance: string;
  offerRate: string;
  joiningRate: string;
  medianLPA: string;
  timeToOffer: string;
  timeToJoin: string;
}

export const KPI_LABELS = {
  en: {
    timeToShortlist: "Time to Shortlist",
    interviewAttendance: "Interview Attendance",
    offerRate: "Offer Rate",
    joiningRate: "Joining Rate",
    medianLPA: "Median LPA",
    timeToOffer: "Time to Offer",
    timeToJoin: "Time to Join",
  },
  hi: {
    timeToShortlist: "शॉर्टलिस्ट में समय",
    interviewAttendance: "इंटरव्यू उपस्थिति",
    offerRate: "ऑफर रेट",
    joiningRate: "ज्वाइनिंग रेट",
    medianLPA: "औसत सैलरी (LPA)",
    timeToOffer: "ऑफर में समय",
    timeToJoin: "ज्वाइन में समय",
  },
} as const;

export type CohortFilterKey = "role" | "city" | "language" | "degree" | "month";

export interface CohortFilters {
  role?: string[];
  city?: string[];
  language?: string[];
  degree?: string[];
  month?: string[];
}

export const COHORT_FILTER_LABELS = {
  en: {
    role: "Role",
    city: "City",
    language: "Language",
    degree: "Degree",
    month: "Month",
    all: "All",
    clearFilters: "Clear Filters",
    applyFilters: "Apply Filters",
  },
  hi: {
    role: "पद",
    city: "शहर",
    language: "भाषा",
    degree: "डिग्री",
    month: "महीना",
    all: "सभी",
    clearFilters: "फ़िल्टर हटाओ",
    applyFilters: "फ़िल्टर लगाओ",
  },
} as const;

export type SLAAlertType = 
  | "delivery_72h" 
  | "aging_candidate" 
  | "stalled_pipeline" 
  | "refund_sla_breach"
  | "interview_noshow";

export type SLASeverity = "info" | "warning" | "critical";

export interface SLAAlert {
  id: string;
  type: SLAAlertType;
  severity: SLASeverity;
  title: string;
  titleHi: string;
  message: string;
  messageHi: string;
  studentId?: string;
  employerId?: string;
  createdAt: string;
  resolvedAt?: string;
  targetAudience: Array<"admin" | "student_success" | "customer_success">;
  metadata?: Record<string, unknown>;
}

export const SLA_ALERT_LABELS = {
  en: {
    delivery_72h: "Delivery SLA Breach",
    aging_candidate: "Aging Candidate",
    stalled_pipeline: "Stalled Pipeline",
    refund_sla_breach: "Refund SLA Breach",
    interview_noshow: "Interview No-Show",
    info: "Info",
    warning: "Warning",
    critical: "Critical",
    resolve: "Mark Resolved",
    view: "View Details",
    alertsTitle: "SLA Alerts",
    noAlerts: "No active alerts",
  },
  hi: {
    delivery_72h: "डिलीवरी SLA टूटा",
    aging_candidate: "उम्मीदवार रुका है",
    stalled_pipeline: "पाइपलाइन रुकी",
    refund_sla_breach: "रिफंड SLA टूटा",
    interview_noshow: "इंटरव्यू में नहीं आए",
    info: "जानकारी",
    warning: "चेतावनी",
    critical: "गंभीर",
    resolve: "हल करें",
    view: "देखें",
    alertsTitle: "SLA अलर्ट",
    noAlerts: "कोई अलर्ट नहीं",
  },
} as const;

export interface OutcomesTrendData {
  date: string;
  shortlisted: number;
  interviewed: number;
  offered: number;
  joined: number;
}

export interface OutcomesBreakdown {
  status: string;
  statusHi: string;
  count: number;
  percentage: number;
}

export interface UnifiedOutcomesData {
  kpis: OutcomesKPIs;
  trends: OutcomesTrendData[];
  breakdown: OutcomesBreakdown[];
  alerts: SLAAlert[];
  filters: CohortFilters;
  lastUpdated: string;
}

export type OutcomesRole = "admin" | "student_success" | "customer_success";

export interface OutcomesExportConfig {
  includeRawData: boolean;
  includePII: boolean;
  format: "csv" | "json";
  dateRange: {
    start: string;
    end: string;
  };
}

export const EXPORT_LABELS = {
  en: {
    export: "Export",
    exportCSV: "Export CSV",
    exportJSON: "Export JSON",
    includeRawData: "Include Raw Data",
    includePII: "Include PII (Admin only)",
    dateRange: "Date Range",
    startDate: "Start Date",
    endDate: "End Date",
    downloading: "Downloading...",
    success: "Export complete",
    error: "Export failed",
    noPIIAccess: "PII export requires Admin role",
  },
  hi: {
    export: "एक्सपोर्ट",
    exportCSV: "CSV डाउनलोड",
    exportJSON: "JSON डाउनलोड",
    includeRawData: "पूरा डेटा शामिल करें",
    includePII: "PII शामिल करें (सिर्फ एडमिन)",
    dateRange: "तारीख सीमा",
    startDate: "शुरू की तारीख",
    endDate: "आखिरी तारीख",
    downloading: "डाउनलोड हो रहा है...",
    success: "एक्सपोर्ट पूरा",
    error: "एक्सपोर्ट असफल",
    noPIIAccess: "PII के लिए एडमिन चाहिए",
  },
} as const;

export const DASHBOARD_LABELS = {
  en: {
    title: "Outcomes Dashboard",
    subtitle: "Unified placement metrics and analytics",
    kpiCards: "Key Performance Indicators",
    trends: "Placement Trends",
    breakdown: "Status Breakdown",
    filters: "Filters",
    refreshData: "Refresh",
    lastUpdated: "Last updated",
    days: "days",
    hours: "hours",
    percent: "%",
    lpa: "LPA",
    noData: "No data available",
    loading: "Loading...",
  },
  hi: {
    title: "आउटकम डैशबोर्ड",
    subtitle: "प्लेसमेंट के आंकड़े",
    kpiCards: "मुख्य आंकड़े",
    trends: "प्लेसमेंट ट्रेंड",
    breakdown: "स्टेटस ब्रेकडाउन",
    filters: "फ़िल्टर",
    refreshData: "रिफ्रेश",
    lastUpdated: "आखिरी अपडेट",
    days: "दिन",
    hours: "घंटे",
    percent: "%",
    lpa: "LPA",
    noData: "डेटा नहीं है",
    loading: "लोड हो रहा है...",
  },
} as const;

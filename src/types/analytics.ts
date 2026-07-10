/**
 * Analytics Types for Employers Page & Admin Dashboard
 */

export interface PageVisit {
  id: string;
  page_name: string;
  visitor_id: string;
  session_id: string;
  timestamp: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  country: string;
  city: string;
  referrer: string;
  session_duration_seconds: number;
  bounced: boolean;
}

export interface PageAnalytics {
  page_name: string;
  total_visitors: number;
  unique_visitors: number;
  total_sessions: number;
  avg_session_duration: number;
  bounce_rate: number;
  returning_visitors: number;
  new_visitors: number;
  date: string;
  device_breakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  top_referrers: Array<{
    referrer: string;
    count: number;
  }>;
  geographic_data: Array<{
    country: string;
    city: string;
    count: number;
  }>;
}

export interface EmployerConversion {
  id: string;
  employer_id?: string;
  page_name: string;
  event_type: 'registration' | 'form_submission' | 'job_posting' | 'profile_view' | 'download';
  timestamp: string;
  user_data?: {
    email?: string;
    company_name?: string;
    phone?: string;
  };
}

export interface AnalyticsSummary {
  date_range: {
    start: string;
    end: string;
  };
  employers_page: {
    total_visitors: number;
    unique_visitors: number;
    bounce_rate: number;
    avg_session_duration: number;
    conversion_rate: number;
  };
  top_countries: Array<{
    country: string;
    visitors: number;
  }>;
  device_stats: {
    mobile_percentage: number;
    desktop_percentage: number;
    tablet_percentage: number;
  };
  traffic_trend: Array<{
    date: string;
    visitors: number;
  }>;
  conversions: {
    total: number;
    registrations: number;
    form_submissions: number;
    job_postings: number;
  };
}

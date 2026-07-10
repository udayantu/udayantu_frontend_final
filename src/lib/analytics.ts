/**
 * Analytics Utilities for Tracking Page Visits
 */

export interface AnalyticsEvent {
  page: string;
  eventType: 'pageview' | 'registration' | 'form_submission' | 'job_posting';
  email?: string;
  company?: string;
  metadata?: Record<string, any>;
}

/**
 * Generate a unique visitor ID
 */
export function generateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  
  let visitorId = localStorage.getItem('ud_visitor_id');
  if (!visitorId) {
    visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('ud_visitor_id', visitorId);
  }
  return visitorId;
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

/**
 * Detect device type
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone/.test(ua)) return 'mobile';
  if (/tablet|ipad|kindle/.test(ua)) return 'tablet';
  return 'desktop';
}

/**
 * Get browser info
 */
export function getBrowserInfo(): { browser: string; os: string } {
  if (typeof window === 'undefined') return { browser: 'Unknown', os: 'Unknown' };
  
  const ua = navigator.userAgent;
  
  let browser = 'Unknown';
  if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') > -1) browser = 'Safari';
  else if (ua.indexOf('Edge') > -1) browser = 'Edge';
  
  let os = 'Unknown';
  if (ua.indexOf('Windows') > -1) os = 'Windows';
  else if (ua.indexOf('Mac') > -1) os = 'MacOS';
  else if (ua.indexOf('Linux') > -1) os = 'Linux';
  else if (ua.indexOf('Android') > -1) os = 'Android';
  else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) os = 'iOS';
  
  return { browser, os };
}

/**
 * Get location from IP (client-side approximation)
 */
export async function getLocationData(): Promise<{ country: string; city: string }> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      country: data.country_name || 'Unknown',
      city: data.city || 'Unknown',
    };
  } catch (e) {
    return { country: 'Unknown', city: 'Unknown' };
  }
}

/**
 * Get Supabase function URL
 */
function getSupabaseFunctionUrl(functionName: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  if (!supabaseUrl) return '';
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/${functionName}`;
}

/**
 * Track page visit
 */
export async function trackPageVisit(page: string): Promise<void> {
  try {
    const visitorId = generateVisitorId();
    const sessionId = generateSessionId();
    const { browser, os } = getBrowserInfo();
    const deviceType = getDeviceType();
    const location = await getLocationData();
    
    const event = {
      page,
      visitor_id: visitorId,
      session_id: sessionId,
      device_type: deviceType,
      browser,
      os,
      country: location.country,
      city: location.city,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
    };
    
    // Send to Supabase edge function
    const url = getSupabaseFunctionUrl('analytics-track');
    if (url) {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(() => {}); // Fail silently
    }
  } catch (e) {
    console.log('Analytics tracking error:', e);
  }
}

/**
 * Track custom event
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const visitorId = generateVisitorId();
    
    const payload = {
      page: event.page,
      event_type: event.eventType,
      visitor_id: visitorId,
      user_data: {
        email: event.email,
        company_name: event.company,
      },
      metadata: event.metadata,
      timestamp: new Date().toISOString(),
    };
    
    const url = getSupabaseFunctionUrl('analytics-event');
    if (url) {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }
  } catch (e) {
    console.log('Event tracking error:', e);
  }
}

/**
 * Employer Authentication System
 * 
 * ⚠️ SECURITY WARNING: This is a DEMO-ONLY implementation for UI preview purposes.
 * 
 * This implementation uses localStorage for demonstration only and should NOT be
 * used in production. For production deployment:
 * 
 * 1. Create an employer_accounts table in Supabase with proper RLS
 * 2. Use Supabase Auth for employer authentication
 * 3. Implement server-side session management
 * 4. Validate all permissions via RLS policies
 * 
 * The demo mode is automatically disabled in production environments.
 */

export type EmployerRole = "admin" | "recruiter" | "interviewer";

export interface EmployerSession {
  id: string;
  email: string;
  phone: string;
  companyName: string;
  role: EmployerRole;
  verified: boolean;
  createdAt: string;
  isDemo: boolean; // Flag to indicate demo session
}

const EMPLOYER_SESSION_KEY = "udayantu_employer_session_demo";
const OTP_EXPIRY_MINUTES = 10;

// Check if we're in demo mode (development only)
const isDemoMode = (): boolean => {
  // Demo mode is only allowed in development
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('.lovable.app'));
  return isLocalhost;
};

/**
 * Generate random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via email (DEMO ONLY - simulated)
 */
export async function sendOTPViaEmail(email: string): Promise<string> {
  if (!isDemoMode()) {
    throw new Error("Employer portal is not available. Please contact support.");
  }
  
  const otp = generateOTP();
  
  // Store OTP in memory with expiry (demo only)
  const otpData = {
    code: otp,
    email,
    expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
  };
  sessionStorage.setItem(`employer_otp_demo_${email}`, JSON.stringify(otpData));
  
  return otp;
}

/**
 * Send OTP via WhatsApp (DEMO ONLY - simulated)
 */
export async function sendOTPViaWhatsApp(phone: string): Promise<string> {
  if (!isDemoMode()) {
    throw new Error("Employer portal is not available. Please contact support.");
  }
  
  const otp = generateOTP();
  
  // Store OTP in memory with expiry (demo only)
  const otpData = {
    code: otp,
    phone,
    expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
  };
  sessionStorage.setItem(`employer_otp_demo_${phone}`, JSON.stringify(otpData));
  
  return otp;
}

/**
 * Check if first admin exists for company (DEMO ONLY)
 */
export function hasAdminForCompany(companyName: string): boolean {
  if (!isDemoMode()) return false;
  
  try {
    const key = `employer_company_admin_demo_${companyName}`;
    return sessionStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

/**
 * Mark company as having admin (DEMO ONLY)
 */
function markCompanyHasAdmin(companyName: string): void {
  if (!isDemoMode()) return;
  const key = `employer_company_admin_demo_${companyName}`;
  sessionStorage.setItem(key, "true");
}

/**
 * Verify OTP and create session (DEMO ONLY)
 */
export async function verifyOTP(
  emailOrPhone: string,
  otp: string,
  companyName: string,
  role: EmployerRole = "recruiter"
): Promise<EmployerSession | null> {
  if (!isDemoMode()) {
    throw new Error("Employer portal is not available in production.");
  }
  
  try {
    const otpKey = `employer_otp_demo_${emailOrPhone}`;
    const storedOTP = sessionStorage.getItem(otpKey);
    
    if (!storedOTP) {
      // OTP not found or expired
      return null;
    }
    
    const otpData = JSON.parse(storedOTP);
    
    // Check OTP expiry
    if (otpData.expiresAt < Date.now()) {
      sessionStorage.removeItem(otpKey);
      // OTP expired
      return null;
    }
    
    // Check OTP code
    if (otpData.code !== otp) {
      // Invalid OTP
      return null;
    }
    
    // First signup must be admin only
    let finalRole = role;
    if (!hasAdminForCompany(companyName)) {
      finalRole = "admin";
      markCompanyHasAdmin(companyName);
    }
    
    // Create demo session with persistent data support
    const session: EmployerSession = {
      id: `demo_emp_${Math.random().toString(36).substr(2, 9)}`,
      email: emailOrPhone.includes("@") ? emailOrPhone : "demo@company.com",
      phone: emailOrPhone.includes("@") ? "+91" : emailOrPhone,
      companyName,
      role: finalRole,
      verified: true,
      createdAt: new Date().toISOString(),
      isDemo: true,
    };
    
    // Save session (using localStorage for persistence across reloads in demo)
    saveEmployerSession(session);
    
    // Clear OTP
    sessionStorage.removeItem(otpKey);
    
    return session;
  } catch (error) {
    // OTP verification failed
    return null;
  }
}

/**
 * Save employer session (DEMO ONLY - uses localStorage for persistence)
 */
export function saveEmployerSession(session: EmployerSession): void {
  if (!isDemoMode()) return;
  localStorage.setItem(EMPLOYER_SESSION_KEY, JSON.stringify(session));
}

/**
 * Get current employer session (DEMO ONLY)
 */
export function getEmployerSession(): EmployerSession | null {
  if (!isDemoMode()) return null;
  
  try {
    const stored = localStorage.getItem(EMPLOYER_SESSION_KEY);
    if (!stored) return null;
    const session = JSON.parse(stored);
    
    // Ensure session has demo flag
    if (session && !session.isDemo) {
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

/**
 * Check if employer is logged in (DEMO ONLY)
 */
export function isEmployerLoggedIn(): boolean {
  return getEmployerSession() !== null;
}

/**
 * Logout employer (DEMO ONLY)
 */
export function logoutEmployer(): void {
  localStorage.removeItem(EMPLOYER_SESSION_KEY);
}

/**
 * Check role permissions (DEMO ONLY - client-side simulation)
 * In production, this should be validated server-side via RLS
 */
export function hasPermission(
  userRole: EmployerRole,
  requiredPermission: string
): boolean {
  const permissions: Record<EmployerRole, string[]> = {
    admin: ["view_all", "manage_jobs", "manage_candidates", "manage_interviews", "view_analytics", "manage_team", "manage_offers"],
    recruiter: ["view_jobs", "manage_candidates", "manage_interviews", "manage_offers"],
    interviewer: ["view_candidates", "provide_feedback"],
  };
  
  return permissions[userRole]?.includes(requiredPermission) ?? false;
}

/**
 * Get accessible features for role (DEMO ONLY)
 */
export function getFeaturesToShow(role: EmployerRole): string[] {
  const features: Record<EmployerRole, string[]> = {
    admin: ["Dashboard", "Jobs", "Candidates", "Interviews", "Analytics", "Team", "Settings"],
    recruiter: ["Dashboard", "Jobs", "Candidates", "Interviews"],
    interviewer: ["Interviews", "Feedback", "Schedule"],
  };
  
  return features[role] || [];
}
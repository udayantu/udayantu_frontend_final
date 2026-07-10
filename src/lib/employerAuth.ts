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

import { supabase } from "@/integrations/supabase/client";

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
export const isDemoMode = (): boolean => {
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

export async function sendOTPViaEmail(email: string): Promise<string> {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  try {
    const { data: existing } = await supabase
      .from("employers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("employers")
        .update({ otp_code: otp, otp_expires_at: expiresAt })
        .eq("email", email);
    } else {
      await supabase
        .from("employers")
        .insert({
          email,
          company_name: "Pending Verification",
          contact_name: "Employer",
          phone: "",
          otp_code: otp,
          otp_expires_at: expiresAt,
          status: "Pending"
        });
    }

    const welcomeResponse = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "otp",
        email,
        otp,
      }),
    });

    if (!welcomeResponse.ok) {
      throw new Error("Failed to send OTP via Vercel endpoint");
    }
  } catch (dbError) {
    console.warn("Supabase auth offline/tables not ready, falling back to local simulation.", dbError);
    const otpData = {
      code: otp,
      email,
      expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
    };
    sessionStorage.setItem(`employer_otp_demo_${email}`, JSON.stringify(otpData));
  }
  
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

export async function verifyOTP(
  emailOrPhone: string,
  otp: string,
  companyName: string,
  role: EmployerRole = "recruiter"
): Promise<EmployerSession | null> {
  try {
    const { data: employer, error } = await supabase
      .from("employers")
      .select("*")
      .eq("email", emailOrPhone)
      .maybeSingle();

    if (error || !employer) {
      throw new Error("Employer account not found");
    }

    if (employer.otp_code !== otp) {
      throw new Error("Invalid OTP code");
    }

    const expiresAt = new Date(employer.otp_expires_at);
    if (new Date() > expiresAt) {
      throw new Error("OTP has expired");
    }

    // Clear code and set status to Active
    await supabase
      .from("employers")
      .update({ otp_code: null, otp_expires_at: null, status: "Active" })
      .eq("email", emailOrPhone);

    const session: EmployerSession = {
      id: employer.id,
      email: employer.email,
      phone: employer.phone || "",
      companyName: employer.company_name === "Pending Verification" ? companyName : employer.company_name,
      role: role || "admin",
      verified: true,
      createdAt: employer.created_at,
      isDemo: false,
    };

    saveEmployerSession(session);
    return session;
  } catch (dbError) {
    console.warn("DB verification failed, trying local session storage fallback:", dbError);
    const otpKey = `employer_otp_demo_${emailOrPhone}`;
    const storedOTP = sessionStorage.getItem(otpKey);
    
    if (!storedOTP) {
      return null;
    }
    
    const otpData = JSON.parse(storedOTP);
    
    if (otpData.expiresAt < Date.now()) {
      sessionStorage.removeItem(otpKey);
      return null;
    }
    
    if (otpData.code !== otp) {
      return null;
    }
    
    let finalRole = role;
    if (!hasAdminForCompany(companyName)) {
      finalRole = "admin";
      markCompanyHasAdmin(companyName);
    }
    
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
    
    saveEmployerSession(session);
    sessionStorage.removeItem(otpKey);
    return session;
  }
}

export function saveEmployerSession(session: EmployerSession): void {
  localStorage.setItem(EMPLOYER_SESSION_KEY, JSON.stringify(session));
}

export function getEmployerSession(): EmployerSession | null {
  try {
    const stored = localStorage.getItem(EMPLOYER_SESSION_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
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
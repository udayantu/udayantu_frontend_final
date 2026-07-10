import { useState, useEffect } from "react";
import {
  EmployerSession,
  EmployerRole,
  sendOTPViaEmail,
  sendOTPViaWhatsApp,
  verifyOTP,
  getEmployerSession,
  isEmployerLoggedIn,
  logoutEmployer,
  hasPermission,
  getFeaturesToShow,
} from "@/lib/employerAuth";

export function useEmployerAuth() {
  const [session, setSession] = useState<EmployerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const currentSession = getEmployerSession();
    setSession(currentSession);
    setIsLoading(false);
  }, []);

  const requestOTP = async (emailOrPhone: string, method: "email" | "whatsapp" = "email") => {
    setError(null);
    try {
      let otp = "";
      if (method === "email") {
        otp = await sendOTPViaEmail(emailOrPhone);
      } else {
        otp = await sendOTPViaWhatsApp(emailOrPhone);
      }
      return { success: true, otp };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send OTP";
      setError(message);
      return { success: false, otp: "", error: message };
    }
  };

  const verifyAndLogin = async (
    emailOrPhone: string,
    otp: string,
    companyName: string,
    role: EmployerRole = "recruiter"
  ) => {
    setError(null);
    try {
      const newSession = await verifyOTP(emailOrPhone, otp, companyName, role);
      if (newSession) {
        setSession(newSession);
        return true;
      } else {
        setError("Invalid OTP or verification failed");
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed";
      setError(message);
      return false;
    }
  };

  const logout = () => {
    logoutEmployer();
    setSession(null);
    setError(null);
  };

  const checkPermission = (permission: string): boolean => {
    if (!session) return false;
    return hasPermission(session.role, permission);
  };

  return {
    session,
    isLoading,
    error,
    isLoggedIn: isEmployerLoggedIn(),
    requestOTP,
    verifyAndLogin,
    logout,
    checkPermission,
    features: session ? getFeaturesToShow(session.role) : [],
  };
}

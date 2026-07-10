/**
 * Role-Based Access Control (RBAC) Type Definitions
 * UdaYantu Main Admin System
 * 
 * PRODUCTION NOTES:
 * This RBAC system is a frontend prototype. For production deployment:
 * 
 * 1. BACKEND ENFORCEMENT: Move permission checks to Supabase RLS policies
 *    and/or server-side middleware. Never trust frontend permission checks alone.
 * 
 * 2. OTP SECURITY: OTP generation/verification should happen server-side only.
 *    Current console.log() of OTP is for demo purposes. In production, use
 *    Supabase Edge Functions with proper SMS/email delivery.
 * 
 * 3. AUDIT PERSISTENCE: Move audit logs from localStorage to Supabase table
 *    with server-side timestamps and cryptographic chaining (prev_hash).
 * 
 * 4. PII MASKING: Backend APIs must filter PII based on role. Current masking
 *    only affects UI display; raw data is still accessible via API.
 * 
 * 5. DEVICE TRUST: Fingerprinting should be supplemented with server-side
 *    session validation and IP logging.
 */

export const ADMIN_ROLES = [
  "main_admin",
  "customer_success", 
  "student_success",
  "content_expert",
  "data_analyst",
  "compliance_officer",
  "mentor_trainer",
  "support_agent",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ROLE_LABELS: Record<AdminRole, { en: string; hi: string }> = {
  main_admin: { en: "Main Admin", hi: "मुख्य व्यवस्थापक" },
  customer_success: { en: "Customer Success", hi: "ग्राहक सफलता" },
  student_success: { en: "Student Success", hi: "छात्र सफलता" },
  content_expert: { en: "Content Expert", hi: "सामग्री विशेषज्ञ" },
  data_analyst: { en: "Data Analyst / BI", hi: "डेटा विश्लेषक" },
  compliance_officer: { en: "Compliance & Trust Officer", hi: "अनुपालन अधिकारी" },
  mentor_trainer: { en: "Mentor / Trainer", hi: "मेंटर / प्रशिक्षक" },
  support_agent: { en: "Support Agent", hi: "सहायता एजेंट" },
};

export const PERMISSIONS = [
  "view_dashboard",
  "view_students",
  "edit_students",
  "export_students",
  "view_employers",
  "edit_employers",
  "verify_employers",
  "export_employers",
  "view_payments",
  "process_refunds",
  "export_payments",
  "view_courses",
  "edit_courses",
  "view_assessments",
  "edit_assessments",
  "view_contacts",
  "respond_contacts",
  "view_analytics",
  "export_analytics",
  "view_compliance",
  "edit_compliance",
  "view_audit_logs",
  "view_integrations",
  "edit_integrations",
  "manage_users",
  "assign_roles",
  "view_all_pii",
  "manage_cohorts",
  "send_notifications",
  "schedule_interviews",
  "provide_feedback",
  "view_mentor_dashboard",
  "assign_mentees",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  main_admin: [
    "view_dashboard",
    "view_students",
    "edit_students",
    "export_students",
    "view_employers",
    "edit_employers",
    "verify_employers",
    "export_employers",
    "view_payments",
    "process_refunds",
    "export_payments",
    "view_courses",
    "edit_courses",
    "view_assessments",
    "edit_assessments",
    "view_contacts",
    "respond_contacts",
    "view_analytics",
    "export_analytics",
    "view_compliance",
    "edit_compliance",
    "view_audit_logs",
    "view_integrations",
    "edit_integrations",
    "manage_users",
    "assign_roles",
    "view_all_pii",
    "manage_cohorts",
    "send_notifications",
    "schedule_interviews",
    "provide_feedback",
    "view_mentor_dashboard",
    "assign_mentees",
  ],
  
  customer_success: [
    "view_dashboard",
    "view_employers",
    "edit_employers",
    "verify_employers",
    "view_contacts",
    "respond_contacts",
    "view_analytics",
    "send_notifications",
    "schedule_interviews",
    "manage_cohorts",
  ],
  
  student_success: [
    "view_dashboard",
    "view_students",
    "edit_students",
    "view_courses",
    "view_assessments",
    "view_contacts",
    "respond_contacts",
    "send_notifications",
    "provide_feedback",
    "view_mentor_dashboard",
  ],
  
  content_expert: [
    "view_dashboard",
    "view_courses",
    "edit_courses",
    "view_assessments",
    "edit_assessments",
  ],
  
  data_analyst: [
    "view_dashboard",
    "view_students",
    "view_employers",
    "view_payments",
    "view_analytics",
    "export_analytics",
    "export_students",
    "export_employers",
    "export_payments",
  ],
  
  compliance_officer: [
    "view_dashboard",
    "view_compliance",
    "edit_compliance",
    "view_audit_logs",
    "view_students",
    "view_employers",
    "view_payments",
  ],
  
  mentor_trainer: [
    "view_dashboard",
    "view_students",
    "view_courses",
    "view_assessments",
    "provide_feedback",
    "view_mentor_dashboard",
    "assign_mentees",
    "send_notifications",
  ],
  
  support_agent: [
    "view_dashboard",
    "view_contacts",
    "respond_contacts",
    "view_students",
    "view_payments",
    "send_notifications",
  ],
};

export const TAB_PERMISSIONS: Record<string, Permission[]> = {
  overview: ["view_dashboard"],
  students: ["view_students"],
  roles: ["view_students", "edit_students"],
  assessments: ["view_assessments"],
  employers: ["view_employers"],
  contacts: ["view_contacts"],
  payments: ["view_payments"],
  courses: ["view_courses"],
  integrations: ["view_integrations"],
  compliance: ["view_compliance"],
  users: ["manage_users"],
  audit: ["view_audit_logs"],
};

export interface AdminUser {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: AdminRole;
  status: "pending" | "active" | "suspended" | "expired";
  invitedBy: string;
  invitedAt: string;
  activatedAt?: string;
  expiresAt?: string;
  lastLoginAt?: string;
  deviceTrust: DeviceTrust[];
  createdAt: string;
  updatedAt: string;
}

export interface DeviceTrust {
  id: string;
  deviceFingerprint: string;
  userAgent: string;
  ipAddress: string;
  trustedAt: string;
  lastUsedAt: string;
  isActive: boolean;
}

export interface AdminInvite {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: AdminRole;
  inviteCode: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  sentVia: "email" | "whatsapp" | "both";
  otpCode?: string;
  otpExpiresAt?: string;
}

export interface RoleChangeAudit {
  id: string;
  userId: string;
  userEmail: string;
  previousRole: AdminRole | null;
  newRole: AdminRole;
  changedBy: string;
  changedByEmail: string;
  reason: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  hash: string;
}

export interface PIIMaskingConfig {
  email: boolean;
  phone: boolean;
  fullName: boolean;
  address: boolean;
  aadhaar: boolean;
}

export const ROLE_PII_ACCESS: Record<AdminRole, PIIMaskingConfig> = {
  main_admin: {
    email: true,
    phone: true,
    fullName: true,
    address: true,
    aadhaar: true,
  },
  customer_success: {
    email: true,
    phone: true,
    fullName: true,
    address: false,
    aadhaar: false,
  },
  student_success: {
    email: true,
    phone: true,
    fullName: true,
    address: false,
    aadhaar: false,
  },
  content_expert: {
    email: false,
    phone: false,
    fullName: true,
    address: false,
    aadhaar: false,
  },
  data_analyst: {
    email: false,
    phone: false,
    fullName: false,
    address: false,
    aadhaar: false,
  },
  compliance_officer: {
    email: true,
    phone: true,
    fullName: true,
    address: true,
    aadhaar: true,
  },
  mentor_trainer: {
    email: true,
    phone: true,
    fullName: true,
    address: false,
    aadhaar: false,
  },
  support_agent: {
    email: true,
    phone: true,
    fullName: true,
    address: false,
    aadhaar: false,
  },
};

export type ConsentType = "data_processing" | "communication" | "analytics" | "marketing" | "cookie_essential" | "cookie_analytics" | "cookie_marketing" | "cookie_functional";

export type ConsentStatus = "accepted" | "rejected" | "withdrawn" | "expired" | "pending";

export type RefundStatus = "not_applicable" | "eligible" | "requested" | "under_review" | "approved" | "processing" | "completed" | "denied" | "appealed";

export type TicketStatus = "open" | "assigned" | "in_progress" | "pending_approval" | "resolved" | "closed";

export type TicketType = "refund_request" | "data_export" | "data_delete" | "consent_inquiry" | "pap_appeal" | "general_support";

export interface ConsentPreference {
  id: string;
  userId: string;
  userType: "student" | "employer" | "admin";
  consentType: ConsentType;
  status: ConsentStatus;
  grantedAt: string;
  expiresAt: string;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  language: "en" | "hi";
}

export interface ConsentAuditRecord {
  id: string;
  consentId: string;
  action: "granted" | "revoked" | "expired" | "renewed";
  timestamp: string;
  userId: string;
  metadata: Record<string, unknown>;
}

export interface RefundCase {
  id: string;
  studentId: string;
  studentName: string;
  requestedAt: string;
  status: RefundStatus;
  amount: number;
  reason: string;
  eligibilityChecklist: RefundEligibilityItem[];
  slaDeadline: string;
  assignedTo?: string;
  assignedRole?: "student_success" | "customer_success" | "admin";
  resolution?: string;
  resolvedAt?: string;
  appealNote?: string;
  appealedAt?: string;
  timeline: RefundTimelineItem[];
}

export interface RefundEligibilityItem {
  id: string;
  label: string;
  labelHi: string;
  required: boolean;
  met: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface RefundTimelineItem {
  id: string;
  action: string;
  actionHi: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  note?: string;
}

export interface ComplianceTicket {
  id: string;
  type: TicketType;
  status: TicketStatus;
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByType: "student" | "employer" | "admin";
  assignedTo?: string;
  assignedRole?: "student_success" | "customer_success" | "admin";
  subject: string;
  subjectHi: string;
  description: string;
  slaDeadline: string;
  resolution?: string;
  resolvedAt?: string;
  relatedEntityId?: string;
  relatedEntityType?: "refund" | "consent" | "data_request";
}

export interface DataRequest {
  id: string;
  userId: string;
  userType: "student" | "employer";
  requestType: "export" | "delete";
  status: "pending" | "approved" | "rejected" | "processing" | "completed";
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  approvedBy?: string;
  reason?: string;
  dataPackageUrl?: string;
}

export interface PAPEligibility {
  studentId: string;
  programCompleted: boolean;
  attendancePercentage: number;
  assessmentsPassed: boolean;
  professionalConduct: boolean;
  daysInProgram: number;
  placementDeadline: string;
  status: "not_started" | "in_progress" | "eligible" | "placed" | "refund_eligible";
}

export const CONSENT_EXPIRY_MONTHS = 12;
export const REFUND_SLA_DAYS = 14;
export const DATA_REQUEST_SLA_DAYS = 30;
export const PAP_PLACEMENT_DAYS = 90;

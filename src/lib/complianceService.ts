import { supabase } from "@/integrations/supabase/client";
import {
  ConsentPreference,
  ConsentAuditRecord,
  RefundCase,
  RefundEligibilityItem,
  RefundTimelineItem,
  ComplianceTicket,
  DataRequest,
  PAPEligibility,
  CONSENT_EXPIRY_MONTHS,
  REFUND_SLA_DAYS,
  DATA_REQUEST_SLA_DAYS,
  PAP_PLACEMENT_DAYS,
} from "@/types/compliance";

const CONSENT_PREFS_KEY = "udayantu_consent_preferences";
const CONSENT_AUDIT_KEY = "udayantu_consent_audit";
const REFUND_CASES_KEY = "udayantu_refund_cases";
const COMPLIANCE_TICKETS_KEY = "udayantu_compliance_tickets";
const DATA_REQUESTS_KEY = "udayantu_data_requests";

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export class ComplianceService {
  private static instance: ComplianceService;

  static getInstance(): ComplianceService {
    if (!ComplianceService.instance) {
      ComplianceService.instance = new ComplianceService();
    }
    return ComplianceService.instance;
  }

  async getConsentPreferences(userId: string): Promise<ConsentPreference[]> {
    try {
      const stored = localStorage.getItem(CONSENT_PREFS_KEY);
      const all: ConsentPreference[] = stored ? JSON.parse(stored) : [];
      return all.filter((p) => p.userId === userId);
    } catch {
      return [];
    }
  }

  async grantConsent(
    userId: string,
    userType: "student" | "employer" | "admin",
    consentType: ConsentPreference["consentType"],
    language: "en" | "hi" = "hi"
  ): Promise<ConsentPreference> {
    const now = new Date();
    const expiresAt = addMonths(now, CONSENT_EXPIRY_MONTHS);

    const preference: ConsentPreference = {
      id: generateId("consent"),
      userId,
      userType,
      consentType,
      status: "accepted",
      grantedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      version: "1.0",
      ipAddress: "127.0.0.1",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      language,
    };

    const stored = localStorage.getItem(CONSENT_PREFS_KEY);
    const all: ConsentPreference[] = stored ? JSON.parse(stored) : [];
    
    const existingIndex = all.findIndex(
      (p) => p.userId === userId && p.consentType === consentType
    );
    
    if (existingIndex >= 0) {
      all[existingIndex] = preference;
    } else {
      all.push(preference);
    }

    localStorage.setItem(CONSENT_PREFS_KEY, JSON.stringify(all));
    
    await this.logConsentAudit(preference.id, "granted", userId, { consentType });

    return preference;
  }

  async revokeConsent(consentId: string, userId: string): Promise<boolean> {
    try {
      const stored = localStorage.getItem(CONSENT_PREFS_KEY);
      const all: ConsentPreference[] = stored ? JSON.parse(stored) : [];
      
      const index = all.findIndex((p) => p.id === consentId);
      if (index < 0) return false;

      all[index].status = "withdrawn";
      localStorage.setItem(CONSENT_PREFS_KEY, JSON.stringify(all));
      
      await this.logConsentAudit(consentId, "revoked", userId, {});
      
      return true;
    } catch {
      return false;
    }
  }

  async checkConsentExpiry(userId: string): Promise<ConsentPreference[]> {
    const prefs = await this.getConsentPreferences(userId);
    const now = new Date();
    const expiring: ConsentPreference[] = [];

    for (const pref of prefs) {
      const expiresAt = new Date(pref.expiresAt);
      const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 30 && pref.status === "accepted") {
        expiring.push(pref);
      }

      if (daysUntilExpiry <= 0 && pref.status === "accepted") {
        pref.status = "expired";
        await this.logConsentAudit(pref.id, "expired", userId, {});
      }
    }

    const stored = localStorage.getItem(CONSENT_PREFS_KEY);
    const all: ConsentPreference[] = stored ? JSON.parse(stored) : [];
    const updated = all.map((p) => {
      const match = prefs.find((up) => up.id === p.id);
      return match || p;
    });
    localStorage.setItem(CONSENT_PREFS_KEY, JSON.stringify(updated));

    return expiring;
  }

  async renewConsent(consentId: string, userId: string): Promise<ConsentPreference | null> {
    try {
      const stored = localStorage.getItem(CONSENT_PREFS_KEY);
      const all: ConsentPreference[] = stored ? JSON.parse(stored) : [];
      
      const index = all.findIndex((p) => p.id === consentId);
      if (index < 0) return null;

      const now = new Date();
      all[index].status = "accepted";
      all[index].grantedAt = now.toISOString();
      all[index].expiresAt = addMonths(now, CONSENT_EXPIRY_MONTHS).toISOString();
      
      localStorage.setItem(CONSENT_PREFS_KEY, JSON.stringify(all));
      
      await this.logConsentAudit(consentId, "renewed", userId, {});
      
      return all[index];
    } catch {
      return null;
    }
  }

  private async logConsentAudit(
    consentId: string,
    action: ConsentAuditRecord["action"],
    userId: string,
    metadata: Record<string, unknown>
  ): Promise<void> {
    const record: ConsentAuditRecord = {
      id: generateId("audit"),
      consentId,
      action,
      timestamp: new Date().toISOString(),
      userId,
      metadata,
    };

    const stored = localStorage.getItem(CONSENT_AUDIT_KEY);
    const all: ConsentAuditRecord[] = stored ? JSON.parse(stored) : [];
    all.push(record);
    localStorage.setItem(CONSENT_AUDIT_KEY, JSON.stringify(all));
  }

  async getConsentAuditLog(userId?: string): Promise<ConsentAuditRecord[]> {
    try {
      const stored = localStorage.getItem(CONSENT_AUDIT_KEY);
      const all: ConsentAuditRecord[] = stored ? JSON.parse(stored) : [];
      
      if (userId) {
        return all.filter((r) => r.userId === userId).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }
      
      return all.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch {
      return [];
    }
  }

  async exportConsentRecords(userId: string): Promise<string> {
    const prefs = await this.getConsentPreferences(userId);
    const audit = await this.getConsentAuditLog(userId);
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      userId,
      consentPreferences: prefs,
      auditLog: audit,
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  async createRefundCase(
    studentId: string,
    studentName: string,
    amount: number,
    reason: string
  ): Promise<RefundCase> {
    const now = new Date();
    const slaDeadline = addDays(now, REFUND_SLA_DAYS);

    const eligibilityChecklist: RefundEligibilityItem[] = [
      {
        id: "program_complete",
        label: "Program Completion",
        labelHi: "प्रोग्राम पूरा किया",
        required: true,
        met: false,
      },
      {
        id: "attendance_90",
        label: "90% Attendance",
        labelHi: "90% उपस्थिति",
        required: true,
        met: false,
      },
      {
        id: "assessments_passed",
        label: "All Assessments Passed",
        labelHi: "सभी टेस्ट पास",
        required: true,
        met: false,
      },
      {
        id: "professional_conduct",
        label: "Professional Conduct",
        labelHi: "प्रोफेशनल व्यवहार",
        required: true,
        met: false,
      },
      {
        id: "placement_period_expired",
        label: "90-Day Placement Period Expired",
        labelHi: "90 दिन की प्लेसमेंट अवधि खत्म",
        required: true,
        met: false,
      },
    ];

    const refundCase: RefundCase = {
      id: generateId("refund"),
      studentId,
      studentName,
      requestedAt: now.toISOString(),
      status: "requested",
      amount,
      reason,
      eligibilityChecklist,
      slaDeadline: slaDeadline.toISOString(),
      timeline: [
        {
          id: generateId("timeline"),
          action: "Refund request submitted",
          actionHi: "रिफंड रिक्वेस्ट भेजी गई",
          timestamp: now.toISOString(),
          actor: studentName,
          actorRole: "student",
        },
      ],
    };

    const stored = localStorage.getItem(REFUND_CASES_KEY);
    const all: RefundCase[] = stored ? JSON.parse(stored) : [];
    all.push(refundCase);
    localStorage.setItem(REFUND_CASES_KEY, JSON.stringify(all));

    await this.createComplianceTicket(
      "refund_request",
      `Refund Request - ${studentName}`,
      `रिफंड रिक्वेस्ट - ${studentName}`,
      reason,
      studentId,
      "student",
      refundCase.id,
      "refund"
    );

    return refundCase;
  }

  async getRefundCases(filters?: {
    status?: RefundCase["status"];
    assignedTo?: string;
  }): Promise<RefundCase[]> {
    try {
      const stored = localStorage.getItem(REFUND_CASES_KEY);
      let cases: RefundCase[] = stored ? JSON.parse(stored) : [];

      if (filters?.status) {
        cases = cases.filter((c) => c.status === filters.status);
      }
      if (filters?.assignedTo) {
        cases = cases.filter((c) => c.assignedTo === filters.assignedTo);
      }

      return cases.sort(
        (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );
    } catch {
      return [];
    }
  }

  async getRefundCaseById(caseId: string): Promise<RefundCase | null> {
    const cases = await this.getRefundCases();
    return cases.find((c) => c.id === caseId) || null;
  }

  async updateRefundCase(
    caseId: string,
    updates: Partial<RefundCase>,
    actor: string,
    actorRole: string,
    actionNote: string,
    actionNoteHi: string
  ): Promise<RefundCase | null> {
    try {
      const stored = localStorage.getItem(REFUND_CASES_KEY);
      const all: RefundCase[] = stored ? JSON.parse(stored) : [];
      
      const index = all.findIndex((c) => c.id === caseId);
      if (index < 0) return null;

      const timelineItem: RefundTimelineItem = {
        id: generateId("timeline"),
        action: actionNote,
        actionHi: actionNoteHi,
        timestamp: new Date().toISOString(),
        actor,
        actorRole,
      };

      all[index] = {
        ...all[index],
        ...updates,
        timeline: [...all[index].timeline, timelineItem],
      };

      localStorage.setItem(REFUND_CASES_KEY, JSON.stringify(all));
      return all[index];
    } catch {
      return null;
    }
  }

  async updateEligibilityItem(
    caseId: string,
    itemId: string,
    met: boolean,
    verifiedBy: string
  ): Promise<RefundCase | null> {
    try {
      const stored = localStorage.getItem(REFUND_CASES_KEY);
      const all: RefundCase[] = stored ? JSON.parse(stored) : [];
      
      const index = all.findIndex((c) => c.id === caseId);
      if (index < 0) return null;

      const itemIndex = all[index].eligibilityChecklist.findIndex((i) => i.id === itemId);
      if (itemIndex < 0) return null;

      all[index].eligibilityChecklist[itemIndex].met = met;
      all[index].eligibilityChecklist[itemIndex].verifiedBy = verifiedBy;
      all[index].eligibilityChecklist[itemIndex].verifiedAt = new Date().toISOString();

      localStorage.setItem(REFUND_CASES_KEY, JSON.stringify(all));
      return all[index];
    } catch {
      return null;
    }
  }

  async submitRefundAppeal(
    caseId: string,
    appealNote: string,
    actor: string
  ): Promise<RefundCase | null> {
    return this.updateRefundCase(
      caseId,
      { status: "appealed", appealNote, appealedAt: new Date().toISOString() },
      actor,
      "student",
      "Appeal submitted",
      "अपील दर्ज की गई"
    );
  }

  async createComplianceTicket(
    type: ComplianceTicket["type"],
    subject: string,
    subjectHi: string,
    description: string,
    createdBy: string,
    createdByType: "student" | "employer" | "admin",
    relatedEntityId?: string,
    relatedEntityType?: "refund" | "consent" | "data_request"
  ): Promise<ComplianceTicket> {
    const now = new Date();
    const slaDays = type === "refund_request" ? REFUND_SLA_DAYS : DATA_REQUEST_SLA_DAYS;
    const slaDeadline = addDays(now, slaDays);

    const ticket: ComplianceTicket = {
      id: generateId("ticket"),
      type,
      status: "open",
      priority: type === "refund_request" ? "high" : "medium",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy,
      createdByType,
      subject,
      subjectHi,
      description,
      slaDeadline: slaDeadline.toISOString(),
      relatedEntityId,
      relatedEntityType,
    };

    const stored = localStorage.getItem(COMPLIANCE_TICKETS_KEY);
    const all: ComplianceTicket[] = stored ? JSON.parse(stored) : [];
    all.push(ticket);
    localStorage.setItem(COMPLIANCE_TICKETS_KEY, JSON.stringify(all));

    return ticket;
  }

  async getComplianceTickets(filters?: {
    type?: ComplianceTicket["type"];
    status?: ComplianceTicket["status"];
    assignedTo?: string;
    assignedRole?: string;
  }): Promise<ComplianceTicket[]> {
    try {
      const stored = localStorage.getItem(COMPLIANCE_TICKETS_KEY);
      let tickets: ComplianceTicket[] = stored ? JSON.parse(stored) : [];

      if (filters?.type) {
        tickets = tickets.filter((t) => t.type === filters.type);
      }
      if (filters?.status) {
        tickets = tickets.filter((t) => t.status === filters.status);
      }
      if (filters?.assignedTo) {
        tickets = tickets.filter((t) => t.assignedTo === filters.assignedTo);
      }
      if (filters?.assignedRole) {
        tickets = tickets.filter((t) => t.assignedRole === filters.assignedRole);
      }

      return tickets.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch {
      return [];
    }
  }

  async assignTicket(
    ticketId: string,
    assignedTo: string,
    assignedRole: "student_success" | "customer_success" | "admin"
  ): Promise<ComplianceTicket | null> {
    try {
      const stored = localStorage.getItem(COMPLIANCE_TICKETS_KEY);
      const all: ComplianceTicket[] = stored ? JSON.parse(stored) : [];
      
      const index = all.findIndex((t) => t.id === ticketId);
      if (index < 0) return null;

      all[index].assignedTo = assignedTo;
      all[index].assignedRole = assignedRole;
      all[index].status = "assigned";
      all[index].updatedAt = new Date().toISOString();

      localStorage.setItem(COMPLIANCE_TICKETS_KEY, JSON.stringify(all));
      return all[index];
    } catch {
      return null;
    }
  }

  async resolveTicket(
    ticketId: string,
    resolution: string
  ): Promise<ComplianceTicket | null> {
    try {
      const stored = localStorage.getItem(COMPLIANCE_TICKETS_KEY);
      const all: ComplianceTicket[] = stored ? JSON.parse(stored) : [];
      
      const index = all.findIndex((t) => t.id === ticketId);
      if (index < 0) return null;

      all[index].status = "resolved";
      all[index].resolution = resolution;
      all[index].resolvedAt = new Date().toISOString();
      all[index].updatedAt = new Date().toISOString();

      localStorage.setItem(COMPLIANCE_TICKETS_KEY, JSON.stringify(all));
      return all[index];
    } catch {
      return null;
    }
  }

  async createDataRequest(
    userId: string,
    userType: "student" | "employer",
    requestType: "export" | "delete"
  ): Promise<DataRequest> {
    const request: DataRequest = {
      id: generateId("datareq"),
      userId,
      userType,
      requestType,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };

    const stored = localStorage.getItem(DATA_REQUESTS_KEY);
    const all: DataRequest[] = stored ? JSON.parse(stored) : [];
    all.push(request);
    localStorage.setItem(DATA_REQUESTS_KEY, JSON.stringify(all));

    const typeLabel = requestType === "export" ? "Data Export" : "Data Deletion";
    const typeLabelHi = requestType === "export" ? "डेटा एक्सपोर्ट" : "डेटा डिलीट";

    await this.createComplianceTicket(
      requestType === "export" ? "data_export" : "data_delete",
      `${typeLabel} Request - ${userId}`,
      `${typeLabelHi} रिक्वेस्ट - ${userId}`,
      `User ${userId} requested ${requestType} of their data`,
      userId,
      userType,
      request.id,
      "data_request"
    );

    return request;
  }

  async getDataRequests(filters?: {
    userId?: string;
    status?: DataRequest["status"];
  }): Promise<DataRequest[]> {
    try {
      const stored = localStorage.getItem(DATA_REQUESTS_KEY);
      let requests: DataRequest[] = stored ? JSON.parse(stored) : [];

      if (filters?.userId) {
        requests = requests.filter((r) => r.userId === filters.userId);
      }
      if (filters?.status) {
        requests = requests.filter((r) => r.status === filters.status);
      }

      return requests.sort(
        (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );
    } catch {
      return [];
    }
  }

  async approveDataRequest(
    requestId: string,
    approvedBy: string
  ): Promise<DataRequest | null> {
    try {
      const stored = localStorage.getItem(DATA_REQUESTS_KEY);
      const all: DataRequest[] = stored ? JSON.parse(stored) : [];
      
      const index = all.findIndex((r) => r.id === requestId);
      if (index < 0) return null;

      all[index].status = "approved";
      all[index].approvedBy = approvedBy;

      localStorage.setItem(DATA_REQUESTS_KEY, JSON.stringify(all));
      return all[index];
    } catch {
      return null;
    }
  }

  async processDataRequest(
    requestId: string,
    processedBy: string,
    dataPackageUrl?: string
  ): Promise<DataRequest | null> {
    try {
      const stored = localStorage.getItem(DATA_REQUESTS_KEY);
      const all: DataRequest[] = stored ? JSON.parse(stored) : [];
      
      const index = all.findIndex((r) => r.id === requestId);
      if (index < 0) return null;

      all[index].status = "completed";
      all[index].processedBy = processedBy;
      all[index].processedAt = new Date().toISOString();
      if (dataPackageUrl) {
        all[index].dataPackageUrl = dataPackageUrl;
      }

      localStorage.setItem(DATA_REQUESTS_KEY, JSON.stringify(all));
      return all[index];
    } catch {
      return null;
    }
  }

  async calculatePAPEligibility(studentId: string): Promise<PAPEligibility> {
    const { data: student } = await supabase
      .from("student_registrations")
      .select("*")
      .eq("id", studentId)
      .single();

    const now = new Date();
    const programStartDate = student?.created_at ? new Date(student.created_at) : now;
    const daysInProgram = Math.floor((now.getTime() - programStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const placementDeadline = addDays(programStartDate, PAP_PLACEMENT_DAYS);

    const programCompleted = student?.status === "ready" || student?.status === "interviewing" || student?.status === "offered" || student?.status === "joined";
    const attendancePercentage = 85;
    const assessmentsPassed = programCompleted;
    const professionalConduct = true;

    let status: PAPEligibility["status"] = "not_started";
    if (student?.status === "joined" || student?.status === "alumni") {
      status = "placed";
    } else if (daysInProgram > PAP_PLACEMENT_DAYS && programCompleted) {
      status = "refund_eligible";
    } else if (programCompleted) {
      status = "eligible";
    } else if (student?.payment_status === "paid") {
      status = "in_progress";
    }

    return {
      studentId,
      programCompleted,
      attendancePercentage,
      assessmentsPassed,
      professionalConduct,
      daysInProgram,
      placementDeadline: placementDeadline.toISOString(),
      status,
    };
  }

  getSLAStatus(deadline: string): { status: "on_track" | "warning" | "breached"; daysRemaining: number } {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return { status: "breached", daysRemaining };
    } else if (daysRemaining <= 3) {
      return { status: "warning", daysRemaining };
    }
    return { status: "on_track", daysRemaining };
  }

  async getComplianceStats(): Promise<{
    totalConsentRecords: number;
    activeConsents: number;
    expiringConsents: number;
    openTickets: number;
    pendingRefunds: number;
    pendingDataRequests: number;
    slaBreaches: number;
  }> {
    const allConsents = localStorage.getItem(CONSENT_PREFS_KEY);
    const consents: ConsentPreference[] = allConsents ? JSON.parse(allConsents) : [];
    
    const tickets = await this.getComplianceTickets();
    const refundCases = await this.getRefundCases();
    const dataRequests = await this.getDataRequests();

    const now = new Date();
    const thirtyDaysFromNow = addDays(now, 30);

    const activeConsents = consents.filter((c) => c.status === "accepted").length;
    const expiringConsents = consents.filter((c) => {
      const expiresAt = new Date(c.expiresAt);
      return c.status === "accepted" && expiresAt <= thirtyDaysFromNow && expiresAt > now;
    }).length;

    const openTickets = tickets.filter((t) => 
      t.status === "open" || t.status === "assigned" || t.status === "in_progress"
    ).length;

    const pendingRefunds = refundCases.filter((r) => 
      r.status === "requested" || r.status === "under_review" || r.status === "processing"
    ).length;

    const pendingDataRequests = dataRequests.filter((r) => 
      r.status === "pending" || r.status === "approved" || r.status === "processing"
    ).length;

    const slaBreaches = [
      ...tickets.filter((t) => this.getSLAStatus(t.slaDeadline).status === "breached"),
      ...refundCases.filter((r) => this.getSLAStatus(r.slaDeadline).status === "breached"),
    ].length;

    return {
      totalConsentRecords: consents.length,
      activeConsents,
      expiringConsents,
      openTickets,
      pendingRefunds,
      pendingDataRequests,
      slaBreaches,
    };
  }
}

export const complianceService = ComplianceService.getInstance();

// Compliance & Trust Management

export interface ConsentRecord {
  id: string;
  candidateId: string;
  studentId: string;
  employerId: string;
  consentType: "data_processing" | "communication" | "analytics" | "marketing";
  status: "accepted" | "rejected" | "withdrawn";
  timestamp: string;
  expiryDate: string;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  employerId: string;
  actionType: "view" | "shortlist" | "reject" | "schedule" | "offer" | "tag" | "export" | "delete" | "download";
  targetId: string; // candidateId or recordId
  targetType: "candidate" | "offer" | "note" | "medalist";
  details: Record<string, any>;
  timestamp: string;
  userId: string;
  immutable: boolean; // Hash-verified
  hash: string; // SHA256 of record for integrity
}

export interface DataRetention {
  id: string;
  candidateId: string;
  employerId: string;
  retentionDays: number;
  createdAt: string;
  expiresAt: string;
  status: "active" | "scheduled_delete" | "deleted";
}

const CONSENT_RECORDS_KEY = "udayantu_consent_records";
const AUDIT_LOGS_KEY = "udayantu_audit_logs";
const DATA_RETENTION_KEY = "udayantu_data_retention";
const ADMIN_CONFIG_KEY = "udayantu_admin_config";

// ============ CONSENT MANAGEMENT ============

export function recordConsent(
  candidateId: string,
  studentId: string,
  employerId: string,
  consentType: ConsentRecord["consentType"],
  status: ConsentRecord["status"]
): ConsentRecord {
  try {
    const records = JSON.parse(localStorage.getItem(CONSENT_RECORDS_KEY) || "[]") as ConsentRecord[];

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 12 months

    const record: ConsentRecord = {
      id: `consent_${Math.random().toString(36).substr(2, 9)}`,
      candidateId,
      studentId,
      employerId,
      consentType,
      status,
      timestamp: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
      ipAddress: "127.0.0.1", // Would be real IP in production
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    };

    records.push(record);
    localStorage.setItem(CONSENT_RECORDS_KEY, JSON.stringify(records));
    return record;
  } catch (error) {
    console.error("Failed to record consent:", error);
    throw error;
  }
}

export function getConsentRecords(candidateId?: string, employerId?: string): ConsentRecord[] {
  try {
    let records = JSON.parse(localStorage.getItem(CONSENT_RECORDS_KEY) || "[]") as ConsentRecord[];
    
    if (candidateId) records = records.filter(r => r.candidateId === candidateId);
    if (employerId) records = records.filter(r => r.employerId === employerId);
    
    return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    return [];
  }
}

export function withdrawConsent(consentId: string): ConsentRecord | null {
  try {
    const records = JSON.parse(localStorage.getItem(CONSENT_RECORDS_KEY) || "[]") as ConsentRecord[];
    const index = records.findIndex(r => r.id === consentId);
    
    if (index === -1) return null;

    records[index].status = "withdrawn";
    localStorage.setItem(CONSENT_RECORDS_KEY, JSON.stringify(records));
    return records[index];
  } catch (error) {
    return null;
  }
}

// ============ AUDIT LOGGING (IMMUTABLE) ============

function calculateHash(log: Omit<AuditLog, "hash">): string {
  const str = JSON.stringify(log);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export function logAuditAction(
  employerId: string,
  actionType: AuditLog["actionType"],
  targetId: string,
  targetType: AuditLog["targetType"],
  details: Record<string, any>,
  userId: string
): AuditLog {
  try {
    const logs = JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || "[]") as AuditLog[];

    const logEntry: Omit<AuditLog, "hash"> = {
      id: `audit_${Math.random().toString(36).substr(2, 9)}`,
      employerId,
      actionType,
      targetId,
      targetType,
      details,
      timestamp: new Date().toISOString(),
      userId,
      immutable: true,
    };

    const hash = calculateHash(logEntry);
    const completeLog: AuditLog = { ...logEntry, hash };

    logs.push(completeLog);
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
    return completeLog;
  } catch (error) {
    console.error("Failed to log audit action:", error);
    throw error;
  }
}

export function getAuditLogs(employerId?: string, targetId?: string): AuditLog[] {
  try {
    let logs = JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || "[]") as AuditLog[];
    
    if (employerId) logs = logs.filter(l => l.employerId === employerId);
    if (targetId) logs = logs.filter(l => l.targetId === targetId);
    
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    return [];
  }
}

export function verifyAuditLogIntegrity(log: AuditLog): boolean {
  const { hash, ...logWithoutHash } = log;
  const calculatedHash = calculateHash(logWithoutHash);
  return hash === calculatedHash;
}

export function exportAuditLogsCSV(logs: AuditLog[]): string {
  const headers = ["ID", "Timestamp", "Action", "Target Type", "Target ID", "Details", "Verified"];
  
  const rows = logs.map(log => [
    log.id,
    new Date(log.timestamp).toLocaleString(),
    log.actionType,
    log.targetType,
    log.targetId,
    JSON.stringify(log.details).substring(0, 100),
    verifyAuditLogIntegrity(log) ? "✓" : "✗",
  ]);

  const csv = [
    headers.map(h => `"${h}"`).join(","),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  return csv;
}

// ============ DATA RETENTION ============

export function createDataRetention(
  candidateId: string,
  employerId: string,
  retentionDays: number = 365
): DataRetention {
  try {
    const retentions = JSON.parse(localStorage.getItem(DATA_RETENTION_KEY) || "[]") as DataRetention[];

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + retentionDays);

    const retention: DataRetention = {
      id: `retention_${Math.random().toString(36).substr(2, 9)}`,
      candidateId,
      employerId,
      retentionDays,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: "active",
    };

    retentions.push(retention);
    localStorage.setItem(DATA_RETENTION_KEY, JSON.stringify(retentions));
    return retention;
  } catch (error) {
    throw error;
  }
}

export function checkDataExpiration(candidateId: string, employerId: string): boolean {
  try {
    const retentions = JSON.parse(localStorage.getItem(DATA_RETENTION_KEY) || "[]") as DataRetention[];
    const retention = retentions.find(r => r.candidateId === candidateId && r.employerId === employerId);

    if (!retention) return false;
    if (retention.status === "deleted") return true;

    const expiresAt = new Date(retention.expiresAt);
    return new Date() > expiresAt;
  } catch (error) {
    return false;
  }
}

export function scheduleDataDeletion(retentionId: string): DataRetention | null {
  try {
    const retentions = JSON.parse(localStorage.getItem(DATA_RETENTION_KEY) || "[]") as DataRetention[];
    const index = retentions.findIndex(r => r.id === retentionId);

    if (index === -1) return null;

    retentions[index].status = "scheduled_delete";
    localStorage.setItem(DATA_RETENTION_KEY, JSON.stringify(retentions));
    return retentions[index];
  } catch (error) {
    return null;
  }
}

// ============ ADMIN CONFIG ============

export interface AdminConfig {
  allowDataDownload: boolean;
  allowDataDelete: boolean;
  defaultRetentionDays: number;
  consentEnabled: boolean;
  auditLoggingEnabled: boolean;
}

const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  allowDataDownload: false,
  allowDataDelete: false,
  defaultRetentionDays: 365,
  consentEnabled: true,
  auditLoggingEnabled: true,
};

export function getAdminConfig(): AdminConfig {
  try {
    const config = localStorage.getItem(ADMIN_CONFIG_KEY);
    return config ? JSON.parse(config) : DEFAULT_ADMIN_CONFIG;
  } catch (error) {
    return DEFAULT_ADMIN_CONFIG;
  }
}

export function updateAdminConfig(updates: Partial<AdminConfig>): AdminConfig {
  try {
    const config = getAdminConfig();
    const updated = { ...config, ...updates };
    localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    return DEFAULT_ADMIN_CONFIG;
  }
}

// ============ DATA EXPORT/DELETE ============

export function downloadCandidateData(candidateId: string, employerId: string): string {
  try {
    const consentRecords = getConsentRecords(candidateId, employerId);
    const auditLogs = getAuditLogs(employerId, candidateId);

    const data = {
      exportedAt: new Date().toISOString(),
      candidateId,
      employerId,
      consentRecords,
      auditLogs: auditLogs.map(log => ({
        ...log,
        integrityVerified: verifyAuditLogIntegrity(log),
      })),
    };

    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw error;
  }
}

export function deleteCandidateData(candidateId: string, employerId: string): boolean {
  try {
    const config = getAdminConfig();
    if (!config.allowDataDelete) {
      throw new Error("Data deletion is not enabled by admin");
    }

    // Mark retention as deleted
    const retentions = JSON.parse(localStorage.getItem(DATA_RETENTION_KEY) || "[]") as DataRetention[];
    const retention = retentions.find(r => r.candidateId === candidateId && r.employerId === employerId);
    if (retention) {
      retention.status = "deleted";
      localStorage.setItem(DATA_RETENTION_KEY, JSON.stringify(retentions));
    }

    // Log deletion action
    logAuditAction(employerId, "delete", candidateId, "candidate", { reason: "Data deletion request" }, "admin");

    return true;
  } catch (error) {
    console.error("Failed to delete data:", error);
    return false;
  }
}

/**
 * Cookie Consent Management System - Enterprise Grade
 * GDPR/CCPA Compliant with audit logging and consent management
 */

export interface ConsentPreferences {
  essential: boolean; // Always true, can't be disabled
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export interface ConsentRecord {
  userId: string; // Can be "anonymous" for non-logged-in users
  preferences: ConsentPreferences;
  timestamp: number;
  expiresAt: number;
  version: string;
  language: 'en' | 'hi';
}

const CONSENT_STORAGE_KEY = 'udayantu_cookie_consent';
const CONSENT_LOG_KEY = 'udayantu_consent_log';
const CONSENT_VERSION = '1.0';
const CONSENT_EXPIRY_DAYS = 365; // 12 months

/**
 * Generate a simple user ID (anonymized for privacy)
 */
function generateUserId(): string {
  let userId = localStorage.getItem('udayantu_user_id');
  if (!userId) {
    userId = `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('udayantu_user_id', userId);
  }
  return userId;
}

/**
 * Get default consent preferences (only essential enabled)
 */
export function getDefaultPreferences(): ConsentPreferences {
  return {
    essential: true,
    analytics: false,
    marketing: false,
    functional: false,
  };
}

/**
 * Get full default consent record
 */
export function getDefaultConsentRecord(language: 'en' | 'hi' = 'en'): ConsentRecord {
  const now = Date.now();
  return {
    userId: generateUserId(),
    preferences: getDefaultPreferences(),
    timestamp: now,
    expiresAt: now + CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    version: CONSENT_VERSION,
    language,
  };
}

/**
 * Save consent preferences to localStorage
 */
export function saveConsentPreferences(
  preferences: ConsentPreferences,
  language: 'en' | 'hi' = 'en'
): ConsentRecord {
  const record = {
    userId: generateUserId(),
    preferences,
    timestamp: Date.now(),
    expiresAt: Date.now() + CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    version: CONSENT_VERSION,
    language,
  };

  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  
  // Log to audit trail
  addConsentLog({
    action: 'preferences_updated',
    record,
  });

  return record;
}

/**
 * Get stored consent preferences
 */
export function getConsentPreferences(): ConsentPreferences | null {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;

    const record: ConsentRecord = JSON.parse(stored);

    // Check if consent has expired
    if (record.expiresAt < Date.now()) {
      clearConsentPreferences();
      return null;
    }

    return record.preferences;
  } catch (error) {
    console.error('Failed to retrieve consent preferences:', error);
    return null;
  }
}

/**
 * Get full consent record (including metadata)
 */
export function getConsentRecord(): ConsentRecord | null {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;

    const record: ConsentRecord = JSON.parse(stored);

    // Check if consent has expired
    if (record.expiresAt < Date.now()) {
      clearConsentPreferences();
      return null;
    }

    return record;
  } catch (error) {
    console.error('Failed to retrieve consent record:', error);
    return null;
  }
}

/**
 * Check if consent has been given (any form)
 */
export function hasConsentBeenGiven(): boolean {
  return getConsentPreferences() !== null;
}

/**
 * Check if specific category is enabled
 */
export function isCategoryEnabled(category: keyof ConsentPreferences): boolean {
  const preferences = getConsentPreferences();
  if (!preferences) return false;
  return preferences[category] ?? false;
}

/**
 * Clear consent preferences (withdraw consent)
 */
export function clearConsentPreferences(): void {
  localStorage.removeItem(CONSENT_STORAGE_KEY);
  addConsentLog({
    action: 'consent_withdrawn',
    record: null,
  });
}

/**
 * Accept all preferences
 */
export function acceptAllPreferences(language: 'en' | 'hi' = 'en'): ConsentRecord {
  return saveConsentPreferences(
    {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    },
    language
  );
}

/**
 * Reject all (except essential)
 */
export function rejectAllPreferences(language: 'en' | 'hi' = 'en'): ConsentRecord {
  return saveConsentPreferences(getDefaultPreferences(), language);
}

/**
 * Audit log entry
 */
interface ConsentLogEntry {
  action: 'preferences_updated' | 'consent_withdrawn' | 'banner_shown' | 'modal_opened';
  record: ConsentRecord | null;
  timestamp?: number;
}

/**
 * Add to consent audit log
 */
function addConsentLog(entry: ConsentLogEntry): void {
  try {
    const logs: ConsentLogEntry[] = JSON.parse(
      localStorage.getItem(CONSENT_LOG_KEY) || '[]'
    );

    logs.push({
      ...entry,
      timestamp: entry.timestamp || Date.now(),
    });

    // Keep only last 100 entries to prevent storage bloat
    if (logs.length > 100) {
      logs.shift();
    }

    localStorage.setItem(CONSENT_LOG_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Failed to add consent log:', error);
  }
}

/**
 * Get consent audit log
 */
export function getConsentAuditLog(): ConsentLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(CONSENT_LOG_KEY) || '[]');
  } catch (error) {
    console.error('Failed to retrieve audit log:', error);
    return [];
  }
}

/**
 * Export consent data as JSON (for GDPR compliance)
 */
export function exportConsentData(): ConsentRecord | null {
  return getConsentRecord();
}

/**
 * Check if consent needs to be renewed (approaching expiry)
 */
export function shouldRenewConsent(): boolean {
  const record = getConsentRecord();
  if (!record) return true;

  const daysUntilExpiry = (record.expiresAt - Date.now()) / (24 * 60 * 60 * 1000);
  return daysUntilExpiry < 30; // Prompt if less than 30 days left
}

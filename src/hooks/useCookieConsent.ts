import { useEffect, useState } from 'react';
import {
  ConsentPreferences,
  ConsentRecord,
  getConsentPreferences,
  getConsentRecord,
  saveConsentPreferences,
  acceptAllPreferences,
  rejectAllPreferences,
  clearConsentPreferences,
  hasConsentBeenGiven,
  isCategoryEnabled,
  shouldRenewConsent,
} from '@/lib/cookieConsent';

/**
 * Hook for managing cookie consent throughout the app
 */
export function useCookieConsent() {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);
  const [record, setRecord] = useState<ConsentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize consent state on mount
  useEffect(() => {
    const prefs = getConsentPreferences();
    const rec = getConsentRecord();
    setPreferences(prefs);
    setRecord(rec);
    setIsLoading(false);
  }, []);

  const updatePreferences = (newPrefs: ConsentPreferences) => {
    const updatedRecord = saveConsentPreferences(newPrefs);
    setPreferences(updatedRecord.preferences);
    setRecord(updatedRecord);
  };

  const acceptAll = () => {
    const updatedRecord = acceptAllPreferences();
    setPreferences(updatedRecord.preferences);
    setRecord(updatedRecord);
  };

  const rejectAll = () => {
    const updatedRecord = rejectAllPreferences();
    setPreferences(updatedRecord.preferences);
    setRecord(updatedRecord);
  };

  const withdrawConsent = () => {
    clearConsentPreferences();
    setPreferences(null);
    setRecord(null);
  };

  const checkCategory = (category: keyof ConsentPreferences): boolean => {
    return isCategoryEnabled(category);
  };

  return {
    preferences,
    record,
    isLoading,
    hasConsent: hasConsentBeenGiven(),
    shouldRenew: shouldRenewConsent(),
    updatePreferences,
    acceptAll,
    rejectAll,
    withdrawConsent,
    checkCategory,
  };
}

/**
 * Hook for accessing unified outcomes data
 */

import { useState, useEffect, useCallback } from "react";
import { outcomesService } from "@/lib/outcomesService";
import {
  UnifiedOutcomesData,
  CohortFilters,
  OutcomesRole,
  SLAAlert,
} from "@/types/outcomes";

export function useOutcomes(
  role: OutcomesRole = "admin",
  initialFilters: CohortFilters = {}
) {
  const [data, setData] = useState<UnifiedOutcomesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<CohortFilters>(initialFilters);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await outcomesService.getUnifiedOutcomes(filters, role);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load outcomes"));
    } finally {
      setIsLoading(false);
    }
  }, [filters, role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const updateFilters = useCallback((newFilters: CohortFilters) => {
    setFilters(newFilters);
  }, []);

  return {
    data,
    isLoading,
    error,
    filters,
    setFilters: updateFilters,
    refresh,
  };
}

export function useSLAAlerts(role: OutcomesRole = "admin") {
  const [alerts, setAlerts] = useState<SLAAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await outcomesService.getAlertsForRole(role);
      setAlerts(result);
    } catch (error) {
      console.error("Failed to load SLA alerts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const resolveAlert = useCallback(async (alertId: string) => {
    await outcomesService.resolveAlert(alertId);
    loadAlerts();
  }, [loadAlerts]);

  return {
    alerts,
    isLoading,
    resolveAlert,
    refresh: loadAlerts,
  };
}

export function useParityValidation() {
  const [result, setResult] = useState<{
    isValid: boolean;
    discrepancies: Array<{
      metric: string;
      adminValue: number;
      ssValue: number;
      csValue: number;
      difference: number;
    }>;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const runCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const parityResult = await outcomesService.verifyParity();
      setResult(parityResult);
    } catch (error) {
      console.error("Failed to run parity check:", error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    result,
    isChecking,
    runCheck,
  };
}

export function useHistoricalReconciliation() {
  const [result, setResult] = useState<{
    eventsChecked: number;
    discrepancies: number;
    reconciled: boolean;
  } | null>(null);
  const [isReconciling, setIsReconciling] = useState(false);

  const reconcile = useCallback(async (days: number = 30) => {
    setIsReconciling(true);
    try {
      const reconcileResult = await outcomesService.reconcileHistorical(days);
      setResult(reconcileResult);
    } catch (error) {
      console.error("Failed to reconcile historical data:", error);
    } finally {
      setIsReconciling(false);
    }
  }, []);

  return {
    result,
    isReconciling,
    reconcile,
  };
}

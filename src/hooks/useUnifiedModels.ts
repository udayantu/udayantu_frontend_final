/**
 * React Hook for Unified Models and Event Bus
 * Provides access to canonical types, metrics, and event handling
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  eventBus, 
  DomainEvent, 
  EventType,
  createStudentEvent,
  createCandidateEvent,
  createAssessmentEvent,
} from "@/lib/models/eventBus";
import { 
  metricsService, 
  CohortMetrics, 
  PlacementFunnel, 
  EmployerMetrics 
} from "@/lib/models/metricsService";
import { 
  mapLegacyStudentToCanonical, 
  mapLegacyAssessmentToCanonical,
  LegacyStudentRegistration,
  LegacyAssessment,
} from "@/lib/models/legacyAdapter";
import { 
  CanonicalStudent, 
  CanonicalAssessment,
  StudentStatus,
  isValidTransition,
  getNextStatuses,
} from "@/lib/models/canonicalTypes";
import { registerEventHandlers } from "@/lib/models/eventHandlers";
import { supabase } from "@/integrations/supabase/client";

let handlersRegistered = false;

export function useEventBus() {
  const [lastEvent, setLastEvent] = useState<DomainEvent | null>(null);
  const [eventStats, setEventStats] = useState(eventBus.getEventStats());

  useEffect(() => {
    if (!handlersRegistered) {
      registerEventHandlers();
      handlersRegistered = true;
    }

    const unsubscribe = eventBus.subscribe("*", (event) => {
      setLastEvent(event);
      setEventStats(eventBus.getEventStats());
    });

    return () => unsubscribe();
  }, []);

  const publishEvent = useCallback(async (event: Parameters<typeof eventBus.publish>[0]) => {
    return eventBus.publish(event);
  }, []);

  const replayEvents = useCallback(async (options?: Parameters<typeof eventBus.replay>[0]) => {
    return eventBus.replay(options);
  }, []);

  const getRecentEvents = useCallback((options?: Parameters<typeof eventBus.getRecentEvents>[0]) => {
    return eventBus.getRecentEvents(options);
  }, []);

  return {
    lastEvent,
    eventStats,
    publishEvent,
    replayEvents,
    getRecentEvents,
    createStudentEvent,
    createCandidateEvent,
    createAssessmentEvent,
  };
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: () => metricsService.getDashboardSummary(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCohortMetrics(cohortMonth: string | null) {
  return useQuery({
    queryKey: ["cohort-metrics", cohortMonth],
    queryFn: () => cohortMonth ? metricsService.getCohortMetrics(cohortMonth) : null,
    enabled: !!cohortMonth,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlacementFunnel(filter?: Parameters<typeof metricsService.getPlacementFunnel>[0]) {
  return useQuery({
    queryKey: ["placement-funnel", filter],
    queryFn: () => metricsService.getPlacementFunnel(filter),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEmployerMetrics(employerId: string | null) {
  return useQuery({
    queryKey: ["employer-metrics", employerId],
    queryFn: () => employerId ? metricsService.getEmployerMetrics(employerId) : null,
    enabled: !!employerId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useParityCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [parityResult, setParityResult] = useState<Awaited<ReturnType<typeof metricsService.verifyParityCheck>> | null>(null);

  const runParityCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await metricsService.verifyParityCheck();
      setParityResult(result);
      return result;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    isChecking,
    parityResult,
    runParityCheck,
  };
}

export function useCanonicalStudent(studentId: string | null) {
  return useQuery({
    queryKey: ["canonical-student", studentId],
    queryFn: async () => {
      if (!studentId) return null;

      const { data, error } = await supabase
        .from("student_registrations")
        .select("*")
        .eq("id", studentId)
        .single();

      if (error) throw error;
      return mapLegacyStudentToCanonical(data as LegacyStudentRegistration);
    },
    enabled: !!studentId,
  });
}

export function useCanonicalStudents(options?: { limit?: number; status?: StudentStatus }) {
  return useQuery({
    queryKey: ["canonical-students", options],
    queryFn: async () => {
      let query = supabase.from("student_registrations").select("*");

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      let students = (data || []).map((s) => 
        mapLegacyStudentToCanonical(s as LegacyStudentRegistration)
      );

      if (options?.status) {
        students = students.filter((s) => s.status === options.status);
      }

      return students;
    },
  });
}

export function useStudentAssessments(studentId: string | null) {
  return useQuery({
    queryKey: ["student-assessments", studentId],
    queryFn: async () => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("student_id", studentId);

      if (error) throw error;
      return (data || []).map((a) => 
        mapLegacyAssessmentToCanonical(a as LegacyAssessment)
      );
    },
    enabled: !!studentId,
  });
}

export function useStatusTransitions(entityType: "student" | "candidate" | "assessment", currentStatus: string) {
  const [validNextStatuses, setValidNextStatuses] = useState<string[]>([]);

  useEffect(() => {
    setValidNextStatuses(getNextStatuses(entityType, currentStatus));
  }, [entityType, currentStatus]);

  const canTransitionTo = useCallback((targetStatus: string) => {
    return isValidTransition(entityType, currentStatus, targetStatus);
  }, [entityType, currentStatus]);

  return {
    validNextStatuses,
    canTransitionTo,
  };
}

export function useEventReplay() {
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayResult, setReplayResult] = useState<{ replayed: number; errors: number } | null>(null);
  const queryClient = useQueryClient();

  const replayLastWeek = useCallback(async () => {
    setIsReplaying(true);
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const result = await eventBus.replay({
        fromDate: oneWeekAgo.toISOString(),
      });

      setReplayResult(result);

      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["placement-funnel"] });
      queryClient.invalidateQueries({ queryKey: ["canonical-students"] });

      return result;
    } finally {
      setIsReplaying(false);
    }
  }, [queryClient]);

  const replayByEventType = useCallback(async (eventTypes: EventType[]) => {
    setIsReplaying(true);
    try {
      const result = await eventBus.replay({ eventTypes });
      setReplayResult(result);

      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });

      return result;
    } finally {
      setIsReplaying(false);
    }
  }, [queryClient]);

  return {
    isReplaying,
    replayResult,
    replayLastWeek,
    replayByEventType,
  };
}

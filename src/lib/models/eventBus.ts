/**
 * Event Bus System
 * Centralized event handling with idempotent handlers and replay support
 */

import { StudentStatus, JobCandidateStatus, AssessmentStatus, OfferStatus } from "./canonicalTypes";

export const EVENT_TYPES = [
  "student.registered",
  "student.payment_initiated",
  "student.payment_completed",
  "student.training_started",
  "student.assessment_completed",
  "student.training_completed",
  "student.ready_for_placement",
  "student.interview_scheduled",
  "student.offer_received",
  "student.offer_accepted",
  "student.joined_company",
  "student.became_alumni",
  "candidate.submitted",
  "candidate.shortlisted",
  "candidate.interview_scheduled",
  "candidate.interviewed",
  "candidate.offered",
  "candidate.accepted",
  "candidate.rejected",
  "candidate.joined",
  "candidate.withdrawn",
  "candidate.ready_packet",
  "assessment.scheduled",
  "assessment.started",
  "assessment.submitted",
  "assessment.completed",
  "assessment.verified",
  "assessment.flagged",
  "offer.created",
  "offer.accepted",
  "offer.rejected",
  "offer.expired",
  "offer.revoked",
  "metrics.placement_updated",
  "metrics.cohort_updated",
] as const;

export type EventType = typeof EVENT_TYPES[number];

export interface BaseEvent {
  id: string;
  type: EventType;
  timestamp: string;
  version: number;
  source: "student_dashboard" | "employer_dashboard" | "admin_dashboard" | "system";
  correlationId?: string;
  causationId?: string;
}

export interface StudentEvent extends BaseEvent {
  type: Extract<EventType, `student.${string}`>;
  payload: {
    studentId: string;
    previousStatus?: StudentStatus;
    newStatus?: StudentStatus;
    metadata?: Record<string, unknown>;
  };
}

export interface CandidateEvent extends BaseEvent {
  type: Extract<EventType, `candidate.${string}` & Exclude<EventType, "candidate.ready_packet">>;
  payload: {
    candidateId: string;
    studentId: string;
    jobId: string;
    employerId: string;
    previousStatus?: JobCandidateStatus;
    newStatus?: JobCandidateStatus;
    metadata?: Record<string, unknown>;
  };
}

export interface ReadinessSnapshot {
  toolsProficiency: {
    crm: number;
    jira: number;
    spreadsheets: number;
    communication: number;
  };
  languageLevel: "beginner" | "intermediate" | "advanced";
  attendanceStreak: number;
  totalSessions: number;
  assessmentStates: {
    aptitude: { status: string; score?: number; verified: boolean };
    psychometric: { status: string; score?: number; verified: boolean };
    gk: { status: string; score?: number; verified: boolean };
    final_role: { status: string; score?: number; verified: boolean };
  };
  mentorNotesDigest: string[];
  overallReadinessScore: number;
}

export interface ReadyPacketEvent extends BaseEvent {
  type: "candidate.ready_packet";
  payload: {
    studentId: string;
    studentName: string;
    paymentStatus: "paid";
    currentStatus: StudentStatus;
    readinessSnapshot: ReadinessSnapshot;
    emittedAt: string;
    targetAudience: ("admin" | "student_success" | "customer_success")[];
    metadata?: Record<string, unknown>;
  };
}

export interface AssessmentEvent extends BaseEvent {
  type: Extract<EventType, `assessment.${string}`>;
  payload: {
    assessmentId: string;
    studentId: string;
    assessmentType: "aptitude" | "psychometric" | "gk" | "final_role";
    previousStatus?: AssessmentStatus;
    newStatus?: AssessmentStatus;
    score?: number;
    metadata?: Record<string, unknown>;
  };
}

export interface OfferEvent extends BaseEvent {
  type: Extract<EventType, `offer.${string}`>;
  payload: {
    offerId: string;
    candidateId: string;
    studentId: string;
    jobId: string;
    employerId: string;
    previousStatus?: OfferStatus;
    newStatus?: OfferStatus;
    salary?: number;
    metadata?: Record<string, unknown>;
  };
}

export interface MetricsEvent extends BaseEvent {
  type: Extract<EventType, `metrics.${string}`>;
  payload: {
    metricType: "placement" | "cohort" | "conversion";
    cohortMonth?: string;
    employerId?: string;
    metrics: Record<string, number>;
  };
}

export type DomainEvent = StudentEvent | CandidateEvent | ReadyPacketEvent | AssessmentEvent | OfferEvent | MetricsEvent;

export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void> | void;

interface EventSubscription {
  id: string;
  eventType: EventType | "*";
  handler: EventHandler;
  priority: number;
}

const EVENTS_STORAGE_KEY = "udayantu_event_log";
const PROCESSED_EVENTS_KEY = "udayantu_processed_events";
const MAX_EVENT_LOG_SIZE = 10000;

class EventBusImpl {
  private subscriptions: EventSubscription[] = [];
  private eventLog: DomainEvent[] = [];
  private processedEventIds: Set<string> = new Set();
  private isReplaying: boolean = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (stored) {
        this.eventLog = JSON.parse(stored);
      }
      
      const processed = localStorage.getItem(PROCESSED_EVENTS_KEY);
      if (processed) {
        this.processedEventIds = new Set(JSON.parse(processed));
      }
    } catch (error) {
      console.error("Failed to load event log from storage:", error);
      this.eventLog = [];
      this.processedEventIds = new Set();
    }
  }

  private saveToStorage(): void {
    try {
      if (this.eventLog.length > MAX_EVENT_LOG_SIZE) {
        this.eventLog = this.eventLog.slice(-MAX_EVENT_LOG_SIZE);
      }
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(this.eventLog));
      localStorage.setItem(PROCESSED_EVENTS_KEY, JSON.stringify([...this.processedEventIds]));
    } catch (error) {
      console.error("Failed to save event log to storage:", error);
    }
  }

  subscribe<T extends DomainEvent>(
    eventType: EventType | "*",
    handler: EventHandler<T>,
    priority: number = 0
  ): () => void {
    const subscription: EventSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      handler: handler as EventHandler,
      priority,
    };

    this.subscriptions.push(subscription);
    this.subscriptions.sort((a, b) => b.priority - a.priority);

    return () => {
      const index = this.subscriptions.findIndex((s) => s.id === subscription.id);
      if (index !== -1) {
        this.subscriptions.splice(index, 1);
      }
    };
  }

  async publish(event: Omit<DomainEvent, "id" | "timestamp" | "version">): Promise<DomainEvent> {
    const fullEvent: DomainEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      version: 1,
    } as DomainEvent;

    this.eventLog.push(fullEvent);
    this.saveToStorage();

    await this.dispatch(fullEvent);

    return fullEvent;
  }

  private async dispatch(event: DomainEvent): Promise<void> {
    if (this.processedEventIds.has(event.id) && !this.isReplaying) {
      console.log(`Event ${event.id} already processed, skipping`);
      return;
    }

    const handlers = this.subscriptions.filter(
      (s) => s.eventType === "*" || s.eventType === event.type
    );

    for (const subscription of handlers) {
      try {
        await subscription.handler(event);
      } catch (error) {
        console.error(`Handler failed for event ${event.id}:`, error);
      }
    }

    this.processedEventIds.add(event.id);
    this.saveToStorage();
  }

  async replay(options: {
    fromDate?: string;
    toDate?: string;
    eventTypes?: EventType[];
    limit?: number;
  } = {}): Promise<{ replayed: number; errors: number }> {
    const { fromDate, toDate, eventTypes, limit } = options;
    
    this.isReplaying = true;
    let replayed = 0;
    let errors = 0;

    try {
      let events = [...this.eventLog];

      if (fromDate) {
        events = events.filter((e) => e.timestamp >= fromDate);
      }
      if (toDate) {
        events = events.filter((e) => e.timestamp <= toDate);
      }
      if (eventTypes && eventTypes.length > 0) {
        events = events.filter((e) => eventTypes.includes(e.type));
      }
      if (limit) {
        events = events.slice(-limit);
      }

      events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

      for (const event of events) {
        try {
          this.processedEventIds.delete(event.id);
          await this.dispatch(event);
          replayed++;
        } catch (error) {
          console.error(`Replay failed for event ${event.id}:`, error);
          errors++;
        }
      }
    } finally {
      this.isReplaying = false;
    }

    return { replayed, errors };
  }

  getRecentEvents(options: {
    limit?: number;
    eventTypes?: EventType[];
    sinceTimestamp?: string;
  } = {}): DomainEvent[] {
    const { limit = 100, eventTypes, sinceTimestamp } = options;
    
    let events = [...this.eventLog];

    if (sinceTimestamp) {
      events = events.filter((e) => e.timestamp > sinceTimestamp);
    }
    if (eventTypes && eventTypes.length > 0) {
      events = events.filter((e) => eventTypes.includes(e.type));
    }

    return events.slice(-limit);
  }

  getEventStats(): {
    totalEvents: number;
    processedEvents: number;
    eventsByType: Record<string, number>;
    lastEventAt: string | null;
  } {
    const eventsByType: Record<string, number> = {};
    
    for (const event of this.eventLog) {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    }

    return {
      totalEvents: this.eventLog.length,
      processedEvents: this.processedEventIds.size,
      eventsByType,
      lastEventAt: this.eventLog.length > 0 
        ? this.eventLog[this.eventLog.length - 1].timestamp 
        : null,
    };
  }

  clearOldEvents(olderThan: string): number {
    const initialCount = this.eventLog.length;
    this.eventLog = this.eventLog.filter((e) => e.timestamp >= olderThan);
    this.saveToStorage();
    return initialCount - this.eventLog.length;
  }
}

export const eventBus = new EventBusImpl();

export function createStudentEvent(
  type: StudentEvent["type"],
  studentId: string,
  options: {
    previousStatus?: StudentStatus;
    newStatus?: StudentStatus;
    source?: BaseEvent["source"];
    metadata?: Record<string, unknown>;
    correlationId?: string;
  } = {}
): Omit<StudentEvent, "id" | "timestamp" | "version"> {
  return {
    type,
    source: options.source || "system",
    correlationId: options.correlationId,
    payload: {
      studentId,
      previousStatus: options.previousStatus,
      newStatus: options.newStatus,
      metadata: options.metadata,
    },
  };
}

export function createCandidateEvent(
  type: CandidateEvent["type"],
  candidateId: string,
  studentId: string,
  jobId: string,
  employerId: string,
  options: {
    previousStatus?: JobCandidateStatus;
    newStatus?: JobCandidateStatus;
    source?: BaseEvent["source"];
    metadata?: Record<string, unknown>;
    correlationId?: string;
  } = {}
): Omit<CandidateEvent, "id" | "timestamp" | "version"> {
  return {
    type,
    source: options.source || "system",
    correlationId: options.correlationId,
    payload: {
      candidateId,
      studentId,
      jobId,
      employerId,
      previousStatus: options.previousStatus,
      newStatus: options.newStatus,
      metadata: options.metadata,
    },
  };
}

export function createAssessmentEvent(
  type: AssessmentEvent["type"],
  assessmentId: string,
  studentId: string,
  assessmentType: "aptitude" | "psychometric" | "gk" | "final_role",
  options: {
    previousStatus?: AssessmentStatus;
    newStatus?: AssessmentStatus;
    score?: number;
    source?: BaseEvent["source"];
    metadata?: Record<string, unknown>;
    correlationId?: string;
  } = {}
): Omit<AssessmentEvent, "id" | "timestamp" | "version"> {
  return {
    type,
    source: options.source || "system",
    correlationId: options.correlationId,
    payload: {
      assessmentId,
      studentId,
      assessmentType,
      previousStatus: options.previousStatus,
      newStatus: options.newStatus,
      score: options.score,
      metadata: options.metadata,
    },
  };
}

export function createOfferEvent(
  type: OfferEvent["type"],
  offerId: string,
  candidateId: string,
  studentId: string,
  jobId: string,
  employerId: string,
  options: {
    previousStatus?: OfferStatus;
    newStatus?: OfferStatus;
    salary?: number;
    source?: BaseEvent["source"];
    metadata?: Record<string, unknown>;
    correlationId?: string;
  } = {}
): Omit<OfferEvent, "id" | "timestamp" | "version"> {
  return {
    type,
    source: options.source || "system",
    correlationId: options.correlationId,
    payload: {
      offerId,
      candidateId,
      studentId,
      jobId,
      employerId,
      previousStatus: options.previousStatus,
      newStatus: options.newStatus,
      salary: options.salary,
      metadata: options.metadata,
    },
  };
}

export function createMetricsEvent(
  type: MetricsEvent["type"],
  metricType: "placement" | "cohort" | "conversion",
  metrics: Record<string, number>,
  options: {
    cohortMonth?: string;
    employerId?: string;
    source?: BaseEvent["source"];
    correlationId?: string;
  } = {}
): Omit<MetricsEvent, "id" | "timestamp" | "version"> {
  return {
    type,
    source: options.source || "system",
    correlationId: options.correlationId,
    payload: {
      metricType,
      cohortMonth: options.cohortMonth,
      employerId: options.employerId,
      metrics,
    },
  };
}

const READY_PACKET_THRESHOLD = 70;

export interface CreateReadyPacketOptions {
  paymentStatus: string;
  currentStatus: StudentStatus;
  readinessSnapshot: ReadinessSnapshot;
  studentName: string;
  source?: BaseEvent["source"];
  metadata?: Record<string, unknown>;
  correlationId?: string;
}

export function createReadyPacketEvent(
  studentId: string,
  options: CreateReadyPacketOptions
): Omit<ReadyPacketEvent, "id" | "timestamp" | "version"> | null {
  if (options.paymentStatus !== "paid") {
    console.log(`Ready packet blocked for student ${studentId}: payment not completed`);
    return null;
  }

  const readyStatuses: StudentStatus[] = ["ready", "interviewing", "offered", "joined", "alumni"];
  if (!readyStatuses.includes(options.currentStatus)) {
    console.log(`Ready packet blocked for student ${studentId}: not in ready state (${options.currentStatus})`);
    return null;
  }

  if (options.readinessSnapshot.overallReadinessScore < READY_PACKET_THRESHOLD) {
    console.log(`Ready packet blocked for student ${studentId}: readiness score below threshold (${options.readinessSnapshot.overallReadinessScore})`);
    return null;
  }

  return {
    type: "candidate.ready_packet",
    source: options.source || "student_dashboard",
    correlationId: options.correlationId,
    payload: {
      studentId,
      studentName: options.studentName,
      paymentStatus: "paid",
      currentStatus: options.currentStatus,
      readinessSnapshot: options.readinessSnapshot,
      emittedAt: new Date().toISOString(),
      targetAudience: ["admin", "student_success", "customer_success"],
      metadata: options.metadata,
    },
  };
}

export async function publishCandidateReadyPacket(
  studentId: string,
  options: CreateReadyPacketOptions
): Promise<ReadyPacketEvent | null> {
  const event = createReadyPacketEvent(studentId, options);
  
  if (!event) {
    return null;
  }

  const publishedEvent = await eventBus.publish(event);
  return publishedEvent as ReadyPacketEvent;
}

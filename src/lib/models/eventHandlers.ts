/**
 * Event Handlers
 * Idempotent handlers that update views and maintain consistency
 */

import { eventBus, DomainEvent, StudentEvent, CandidateEvent, AssessmentEvent, OfferEvent, ReadyPacketEvent } from "./eventBus";
import { metricsService } from "./metricsService";
import { supabase } from "@/integrations/supabase/client";

const PROCESSED_HANDLERS_KEY = "udayantu_processed_handlers";
const READY_PACKETS_STORAGE_KEY = "udayantu_ready_packets";

function getProcessedHandlers(): Set<string> {
  try {
    const stored = localStorage.getItem(PROCESSED_HANDLERS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function saveProcessedHandler(handlerKey: string): void {
  try {
    const processed = getProcessedHandlers();
    processed.add(handlerKey);
    
    if (processed.size > 10000) {
      const entries = Array.from(processed);
      entries.slice(0, 5000).forEach((key) => processed.delete(key));
    }
    
    localStorage.setItem(PROCESSED_HANDLERS_KEY, JSON.stringify([...processed]));
  } catch (error) {
    console.error("Failed to save processed handler:", error);
  }
}

function createIdempotentHandler<T extends DomainEvent>(
  name: string,
  handler: (event: T) => Promise<void>
): (event: T) => Promise<void> {
  return async (event: T) => {
    const handlerKey = `${name}_${event.id}`;
    const processed = getProcessedHandlers();
    
    if (processed.has(handlerKey)) {
      console.log(`Handler ${name} already processed event ${event.id}`);
      return;
    }

    try {
      await handler(event);
      saveProcessedHandler(handlerKey);
    } catch (error) {
      console.error(`Handler ${name} failed for event ${event.id}:`, error);
      throw error;
    }
  };
}

const CANONICAL_TO_LEGACY_STATUS: Record<string, string> = {
  signup: "registered",
  signin: "registered",
  payment: "pending",
  enrolled: "active",
  in_training: "in_training",
  ready: "completed",
  interviewing: "interviewing",
  offered: "offered",
  joined: "placed",
  alumni: "alumni",
};

async function handleStudentStatusChange(event: StudentEvent): Promise<void> {
  const { studentId, newStatus, previousStatus } = event.payload;

  console.log(`Student ${studentId} status changed: ${previousStatus} -> ${newStatus}`);

  if (!newStatus) return;

  const legacyStatus = CANONICAL_TO_LEGACY_STATUS[newStatus] || newStatus;
  
  const updates: Record<string, unknown> = { status: legacyStatus };

  if (newStatus === "in_training") {
    updates.training_started_at = new Date().toISOString();
  }

  if (newStatus === "ready") {
    updates.training_completed_at = new Date().toISOString();
  }

  await supabase
    .from("student_registrations")
    .update(updates)
    .eq("id", studentId);
}

const CANDIDATE_STAGE_TO_STUDENT_STATUS: Record<string, string> = {
  new: "ready",
  shortlisted: "ready",
  interview: "interviewing",
  offered: "offered",
  joined: "placed",
  rejected: "ready",
  withdrawn: "ready",
};

async function handleCandidateProgress(event: CandidateEvent): Promise<void> {
  const { candidateId, studentId, jobId, newStatus } = event.payload;

  console.log(`Candidate ${candidateId} moved to ${newStatus} for job ${jobId}`);

  const candidates = JSON.parse(localStorage.getItem("udayantu_candidates_pipeline") || "[]");
  const candidateIndex = candidates.findIndex((c: { id: string }) => c.id === candidateId);
  
  if (candidateIndex !== -1) {
    candidates[candidateIndex] = {
      ...candidates[candidateIndex],
      stageName: newStatus?.charAt(0).toUpperCase() + newStatus?.slice(1) || "New",
      movedAt: new Date().toISOString(),
    };
    localStorage.setItem("udayantu_candidates_pipeline", JSON.stringify(candidates));
  }

  if (newStatus && studentId) {
    const { data: student } = await supabase
      .from("student_registrations")
      .select("payment_status, status")
      .eq("id", studentId)
      .single();

    if (student?.payment_status !== "paid") {
      console.log(`Skipping status update for unpaid student ${studentId}`);
      return;
    }

    const currentStatus = student?.status;
    const legacyStatus = CANDIDATE_STAGE_TO_STUDENT_STATUS[newStatus];
    
    if (!legacyStatus) {
      console.log(`No mapping for candidate status ${newStatus}`);
      return;
    }

    const statusOrder = ["active", "in_training", "completed", "ready", "interviewing", "offered", "placed", "alumni"];
    const currentIndex = statusOrder.indexOf(currentStatus || "");
    const newIndex = statusOrder.indexOf(legacyStatus);

    if (newIndex > currentIndex) {
      await supabase
        .from("student_registrations")
        .update({ status: legacyStatus })
        .eq("id", studentId);
    } else {
      console.log(`Not downgrading status from ${currentStatus} to ${legacyStatus}`);
    }
  }
}

async function handleAssessmentCompletion(event: AssessmentEvent): Promise<void> {
  const { assessmentId, studentId, assessmentType, score, newStatus } = event.payload;

  console.log(`Assessment ${assessmentId} completed with score ${score}`);

  if (newStatus === "completed" || newStatus === "verified") {
    const { data: student } = await supabase
      .from("student_registrations")
      .select("assessments_progress")
      .eq("id", studentId)
      .single();

    const existingProgress = student?.assessments_progress;
    const progress: Record<string, { completed: boolean; score?: number; completedAt: string }> = 
      typeof existingProgress === "object" && existingProgress !== null && !Array.isArray(existingProgress)
        ? (existingProgress as Record<string, { completed: boolean; score?: number; completedAt: string }>)
        : {};
    
    progress[assessmentType] = {
      completed: true,
      score,
      completedAt: new Date().toISOString(),
    };

    await supabase
      .from("student_registrations")
      .update({ assessments_progress: progress as never })
      .eq("id", studentId);
  }
}

const OFFER_STATUS_TO_STUDENT_STATUS: Record<string, string> = {
  created: "offered",
  accepted: "offered",
  rejected: "interviewing",
  expired: "interviewing",
  revoked: "interviewing",
  joined: "placed",
};

async function handleOfferAccepted(event: OfferEvent): Promise<void> {
  const { offerId, studentId, newStatus } = event.payload;

  console.log(`Offer ${offerId} ${newStatus} for student ${studentId}`);

  if (newStatus && studentId) {
    const { data: student } = await supabase
      .from("student_registrations")
      .select("payment_status, status")
      .eq("id", studentId)
      .single();

    if (student?.payment_status !== "paid") {
      console.log(`Skipping offer status update for unpaid student ${studentId}`);
      return;
    }

    const currentStatus = student?.status;
    const legacyStatus = OFFER_STATUS_TO_STUDENT_STATUS[newStatus];
    
    if (!legacyStatus) {
      console.log(`No mapping for offer status ${newStatus}`);
      return;
    }

    const statusOrder = ["active", "in_training", "completed", "ready", "interviewing", "offered", "placed", "alumni"];
    const currentIndex = statusOrder.indexOf(currentStatus || "");
    const newIndex = statusOrder.indexOf(legacyStatus);

    if (newIndex > currentIndex) {
      await supabase
        .from("student_registrations")
        .update({ status: legacyStatus })
        .eq("id", studentId);
    } else {
      console.log(`Not downgrading status from ${currentStatus} to ${legacyStatus}`);
    }
  }
}

async function updateMetricsOnPlacementChange(event: DomainEvent): Promise<void> {
  console.log("Updating metrics cache after placement change");
  
  await metricsService.getDashboardSummary();
}

export interface StoredReadyPacket {
  id: string;
  studentId: string;
  studentName: string;
  readinessScore: number;
  toolsProficiency: {
    crm: number;
    jira: number;
    spreadsheets: number;
    communication: number;
  };
  languageLevel: string;
  attendanceStreak: number;
  assessmentCount: number;
  emittedAt: string;
  targetAudience: string[];
  viewedBy: { role: string; userId: string; viewedAt: string }[];
  status: "new" | "viewed" | "actioned";
}

const MOCK_READY_PACKETS: StoredReadyPacket[] = [
  {
    id: "rp1",
    studentId: "s1",
    studentName: "Amit Kumar Sharma",
    readinessScore: 92,
    toolsProficiency: {
      crm: 4,
      jira: 5,
      spreadsheets: 4,
      communication: 5
    },
    languageLevel: "advanced",
    attendanceStreak: 18,
    assessmentCount: 3,
    emittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    targetAudience: ["admin", "student_success", "customer_success"],
    viewedBy: [],
    status: "new"
  },
  {
    id: "rp2",
    studentId: "s4",
    studentName: "Pooja Verma",
    readinessScore: 88,
    toolsProficiency: {
      crm: 5,
      jira: 4,
      spreadsheets: 3,
      communication: 4
    },
    languageLevel: "intermediate",
    attendanceStreak: 12,
    assessmentCount: 2,
    emittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    targetAudience: ["admin", "student_success"],
    viewedBy: [],
    status: "new"
  }
];

function getStoredReadyPackets(): StoredReadyPacket[] {
  try {
    const stored = localStorage.getItem(READY_PACKETS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(READY_PACKETS_STORAGE_KEY, JSON.stringify(MOCK_READY_PACKETS));
      return MOCK_READY_PACKETS;
    }
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveReadyPacket(packet: StoredReadyPacket): void {
  try {
    const packets = getStoredReadyPackets();
    const existingIndex = packets.findIndex(p => p.studentId === packet.studentId);
    
    if (existingIndex !== -1) {
      packets[existingIndex] = { ...packets[existingIndex], ...packet, id: packets[existingIndex].id };
    } else {
      packets.push(packet);
    }
    
    if (packets.length > 500) {
      packets.splice(0, packets.length - 500);
    }
    
    localStorage.setItem(READY_PACKETS_STORAGE_KEY, JSON.stringify(packets));
  } catch (error) {
    console.error("Failed to save ready packet:", error);
  }
}

async function handleReadyPacket(event: ReadyPacketEvent): Promise<void> {
  const { studentId, studentName, readinessSnapshot, emittedAt, targetAudience } = event.payload;

  console.log(`Ready packet received for student ${studentId} (${studentName})`);

  const completedAssessments = Object.values(readinessSnapshot.assessmentStates).filter(
    a => a.status === "completed" || a.verified
  ).length;

  const packet: StoredReadyPacket = {
    id: event.id,
    studentId,
    studentName,
    readinessScore: readinessSnapshot.overallReadinessScore,
    toolsProficiency: readinessSnapshot.toolsProficiency,
    languageLevel: readinessSnapshot.languageLevel,
    attendanceStreak: readinessSnapshot.attendanceStreak,
    assessmentCount: completedAssessments,
    emittedAt,
    targetAudience,
    viewedBy: [],
    status: "new",
  };

  saveReadyPacket(packet);
  console.log(`Ready packet stored for SS/CS pipeline: ${studentName}`);
}

export function getReadyPacketsForRole(role: string): StoredReadyPacket[] {
  const packets = getStoredReadyPackets();
  
  const roleToAudience: Record<string, string[]> = {
    main_admin: ["admin", "student_success", "customer_success"],
    student_success: ["student_success", "admin"],
    customer_success: ["customer_success", "admin"],
    compliance_officer: ["admin"],
  };

  const allowedAudiences = roleToAudience[role] || [];
  
  return packets.filter(p => 
    p.targetAudience.some(audience => allowedAudiences.includes(audience))
  );
}

export function markReadyPacketViewed(packetId: string, role: string, userId: string): void {
  const packets = getStoredReadyPackets();
  const packet = packets.find(p => p.id === packetId);
  
  if (packet) {
    packet.viewedBy.push({ role, userId, viewedAt: new Date().toISOString() });
    packet.status = "viewed";
    localStorage.setItem(READY_PACKETS_STORAGE_KEY, JSON.stringify(packets));
  }
}

export function markReadyPacketActioned(packetId: string): void {
  const packets = getStoredReadyPackets();
  const packet = packets.find(p => p.id === packetId);
  
  if (packet) {
    packet.status = "actioned";
    localStorage.setItem(READY_PACKETS_STORAGE_KEY, JSON.stringify(packets));
  }
}

export function registerEventHandlers(): void {
  eventBus.subscribe<StudentEvent>(
    "student.payment_completed",
    createIdempotentHandler("student_payment", handleStudentStatusChange),
    100
  );

  eventBus.subscribe<StudentEvent>(
    "student.training_started",
    createIdempotentHandler("student_training_start", handleStudentStatusChange),
    100
  );

  eventBus.subscribe<StudentEvent>(
    "student.training_completed",
    createIdempotentHandler("student_training_complete", handleStudentStatusChange),
    100
  );

  eventBus.subscribe<CandidateEvent>(
    "candidate.shortlisted",
    createIdempotentHandler("candidate_shortlist", handleCandidateProgress),
    90
  );

  eventBus.subscribe<CandidateEvent>(
    "candidate.interview_scheduled",
    createIdempotentHandler("candidate_interview", handleCandidateProgress),
    90
  );

  eventBus.subscribe<CandidateEvent>(
    "candidate.offered",
    createIdempotentHandler("candidate_offer", handleCandidateProgress),
    90
  );

  eventBus.subscribe<CandidateEvent>(
    "candidate.joined",
    createIdempotentHandler("candidate_join", handleCandidateProgress),
    90
  );

  eventBus.subscribe<AssessmentEvent>(
    "assessment.completed",
    createIdempotentHandler("assessment_complete", handleAssessmentCompletion),
    80
  );

  eventBus.subscribe<AssessmentEvent>(
    "assessment.verified",
    createIdempotentHandler("assessment_verify", handleAssessmentCompletion),
    80
  );

  eventBus.subscribe<OfferEvent>(
    "offer.accepted",
    createIdempotentHandler("offer_accept", handleOfferAccepted),
    85
  );

  eventBus.subscribe(
    "student.joined_company",
    createIdempotentHandler("metrics_update_join", updateMetricsOnPlacementChange),
    50
  );

  eventBus.subscribe(
    "candidate.joined",
    createIdempotentHandler("metrics_update_candidate", updateMetricsOnPlacementChange),
    50
  );

  eventBus.subscribe<ReadyPacketEvent>(
    "candidate.ready_packet",
    createIdempotentHandler("ready_packet_store", handleReadyPacket),
    95
  );

  console.log("Event handlers registered successfully");
}

export function getHandlerStats(): {
  totalProcessed: number;
  handlerNames: string[];
} {
  const processed = getProcessedHandlers();
  const handlerNames = new Set<string>();
  
  processed.forEach((key) => {
    const name = key.split("_evt_")[0];
    handlerNames.add(name);
  });

  return {
    totalProcessed: processed.size,
    handlerNames: Array.from(handlerNames),
  };
}

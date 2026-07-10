/**
 * Legacy Adapter
 * Maps legacy schemas to canonical models without breaking existing functionality
 */

import {
  CanonicalStudent,
  CanonicalJob,
  CanonicalCandidate,
  CanonicalAssessment,
  CanonicalEmployer,
  StudentStatus,
  AssessmentStatus,
  JobCandidateStatus,
  AssessmentProgress,
  AssessmentAttemptInfo,
} from "./canonicalTypes";

export interface LegacyStudentRegistration {
  id: string;
  user_id?: string | null;
  full_name: string;
  email: string;
  phone: string;
  status?: string | null;
  payment_status?: string | null;
  qualification?: string | null;
  desired_role: string;
  final_role?: string | null;
  role_recommendation?: string | null;
  state?: string | null;
  district?: string | null;
  location?: string | null;
  city?: string | null;
  degree?: string | null;
  training_started_at?: string | null;
  training_completed_at?: string | null;
  assessments_progress?: unknown | null;
  referral_code?: string | null;
  otp_code?: string | null;
  otp_expires_at?: string | null;
  otp_status?: string | null;
  payment_order_id?: string | null;
  invoice_id?: string | null;
  whatsapp?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface LegacyEmployer {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  designation?: string | null;
  roles_needed?: string[] | null;
  tools_stack?: string | null;
  cohort_size_estimate?: number | null;
  hiring_timeline?: string | null;
  notes?: string | null;
  created_at?: string | null;
}

export interface LegacyAssessment {
  id: string;
  student_id?: string | null;
  type: string;
  score?: number | null;
  questions?: unknown | null;
  answers?: unknown | null;
  analysis?: unknown | null;
  attempt_number?: number | null;
  completed_at?: string | null;
  duration_seconds?: number | null;
  recommended_role?: string | null;
  created_at?: string | null;
}

export interface LegacyJobPosting {
  id?: string;
  title: string;
  skills: string[];
  tools: string[];
  languageLevel: "beginner" | "intermediate" | "advanced";
  location: string;
  salaryBandMin: number;
  salaryBandMax: number;
  workType: "full-time" | "part-time" | "contract" | "internship";
  description?: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LegacyCandidateInPipeline {
  id?: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  stageId: string;
  stageName: string;
  movedAt: string;
  notes?: string;
  rating?: number;
  customFields?: Record<string, unknown>;
}

const LEGACY_STATUS_MAP: Record<string, StudentStatus> = {
  "registered": "signup",
  "pending": "payment",
  "active": "enrolled",
  "in_training": "in_training",
  "training": "in_training",
  "completed": "ready",
  "ready": "ready",
  "interviewing": "interviewing",
  "offered": "offered",
  "placed": "joined",
  "joined": "joined",
  "alumni": "alumni",
};

const LEGACY_STAGE_MAP: Record<string, JobCandidateStatus> = {
  "New": "new",
  "Shortlisted": "shortlisted",
  "Interview": "interview",
  "Offered": "offered",
  "Joined": "joined",
  "Rejected": "rejected",
};

export function mapLegacyStudentToCanonical(legacy: LegacyStudentRegistration): CanonicalStudent {
  const legacyStatus = legacy.status || "registered";
  const paymentStatus = legacy.payment_status || "unpaid";
  
  let canonicalStatus: StudentStatus = LEGACY_STATUS_MAP[legacyStatus] || "signup";
  
  if (paymentStatus === "paid" && canonicalStatus === "signup") {
    canonicalStatus = "enrolled";
  } else if (paymentStatus === "pending") {
    canonicalStatus = "payment";
  }
  
  if (legacy.training_started_at && canonicalStatus === "enrolled") {
    canonicalStatus = "in_training";
  }
  if (legacy.training_completed_at && ["enrolled", "in_training"].includes(canonicalStatus)) {
    canonicalStatus = "ready";
  }

  let cohortMonth: string | null = null;
  if (legacy.created_at) {
    const date = new Date(legacy.created_at);
    cohortMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  return {
    id: legacy.id,
    userId: legacy.user_id || null,
    fullName: legacy.full_name,
    email: legacy.email,
    phone: legacy.phone,
    status: canonicalStatus,
    paymentStatus: paymentStatus as CanonicalStudent["paymentStatus"],
    qualification: legacy.qualification || legacy.degree || null,
    desiredRole: legacy.desired_role,
    finalRole: legacy.final_role || legacy.role_recommendation || null,
    state: legacy.state || null,
    district: legacy.district || null,
    location: legacy.location || legacy.city || null,
    enrolledAt: paymentStatus === "paid" ? legacy.created_at || null : null,
    trainingStartedAt: legacy.training_started_at || null,
    trainingCompletedAt: legacy.training_completed_at || null,
    readyAt: legacy.training_completed_at || null,
    placedAt: null,
    joinedAt: null,
    assessmentsProgress: parseAssessmentsProgress(legacy.assessments_progress),
    cohortMonth,
    createdAt: legacy.created_at || new Date().toISOString(),
    updatedAt: legacy.updated_at || new Date().toISOString(),
  };
}

export function mapCanonicalStudentToLegacy(canonical: CanonicalStudent): LegacyStudentRegistration {
  const reversedStatusMap: Record<StudentStatus, string> = {
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

  return {
    id: canonical.id,
    user_id: canonical.userId,
    full_name: canonical.fullName,
    email: canonical.email,
    phone: canonical.phone,
    status: reversedStatusMap[canonical.status],
    payment_status: canonical.paymentStatus,
    qualification: canonical.qualification,
    desired_role: canonical.desiredRole,
    final_role: canonical.finalRole,
    state: canonical.state,
    district: canonical.district,
    location: canonical.location,
    training_started_at: canonical.trainingStartedAt,
    training_completed_at: canonical.trainingCompletedAt,
    assessments_progress: canonical.assessmentsProgress,
    created_at: canonical.createdAt,
    updated_at: canonical.updatedAt,
  };
}

export function mapLegacyEmployerToCanonical(legacy: LegacyEmployer): CanonicalEmployer {
  return {
    id: legacy.id,
    companyName: legacy.company_name,
    contactName: legacy.contact_name,
    email: legacy.email,
    phone: legacy.phone,
    designation: legacy.designation || null,
    rolesNeeded: legacy.roles_needed || null,
    toolsStack: legacy.tools_stack || null,
    cohortSizeEstimate: legacy.cohort_size_estimate || null,
    hiringTimeline: legacy.hiring_timeline || null,
    notes: legacy.notes || null,
    isActive: true,
    createdAt: legacy.created_at || new Date().toISOString(),
    updatedAt: null,
  };
}

export function mapLegacyJobToCanonical(legacy: LegacyJobPosting): CanonicalJob {
  return {
    id: legacy.id || `job_${Date.now()}`,
    companyId: legacy.companyId,
    title: legacy.title,
    skills: legacy.skills,
    tools: legacy.tools,
    languageLevel: legacy.languageLevel,
    location: legacy.location,
    salaryBandMin: legacy.salaryBandMin,
    salaryBandMax: legacy.salaryBandMax,
    workType: legacy.workType,
    description: legacy.description || null,
    isActive: true,
    createdAt: legacy.createdAt || new Date().toISOString(),
    updatedAt: legacy.updatedAt || new Date().toISOString(),
    closedAt: null,
  };
}

export function mapLegacyCandidateToCanonical(legacy: LegacyCandidateInPipeline, studentId: string): CanonicalCandidate {
  const stageStatus = LEGACY_STAGE_MAP[legacy.stageName] || "new";

  return {
    id: legacy.id || `cand_${Date.now()}`,
    studentId,
    studentName: legacy.candidateName,
    studentEmail: legacy.candidateEmail,
    jobId: legacy.jobId,
    status: stageStatus,
    currentStage: legacy.stageName,
    fitScore: null,
    appliedAt: legacy.movedAt,
    shortlistedAt: stageStatus === "shortlisted" || ["interview", "offered", "joined"].includes(stageStatus) 
      ? legacy.movedAt : null,
    interviewScheduledAt: stageStatus === "interview" || ["offered", "joined"].includes(stageStatus) 
      ? legacy.movedAt : null,
    offeredAt: stageStatus === "offered" || stageStatus === "joined" ? legacy.movedAt : null,
    joinedAt: stageStatus === "joined" ? legacy.movedAt : null,
    rejectedAt: stageStatus === "rejected" ? legacy.movedAt : null,
    notes: legacy.notes || null,
    rating: legacy.rating || null,
  };
}

export function mapLegacyAssessmentToCanonical(legacy: LegacyAssessment): CanonicalAssessment {
  let status: AssessmentStatus = "scheduled";
  
  if (legacy.completed_at) {
    status = "completed";
    if (legacy.score !== null && legacy.score !== undefined) {
      status = "verified";
    }
  } else if (legacy.answers) {
    status = "in_progress";
  }

  return {
    id: legacy.id,
    studentId: legacy.student_id || "",
    type: legacy.type as CanonicalAssessment["type"],
    status,
    score: legacy.score || null,
    questions: legacy.questions,
    answers: legacy.answers,
    analysis: legacy.analysis,
    attemptNumber: legacy.attempt_number || 1,
    scheduledAt: null,
    startedAt: legacy.created_at || null,
    completedAt: legacy.completed_at || null,
    verifiedAt: legacy.completed_at || null,
    verifiedBy: null,
    flagReason: null,
    durationSeconds: legacy.duration_seconds || null,
    recommendedRole: legacy.recommended_role || null,
    createdAt: legacy.created_at || new Date().toISOString(),
  };
}

function parseAssessmentsProgress(progress: unknown): AssessmentProgress | null {
  if (!progress || typeof progress !== "object") {
    return null;
  }

  const p = progress as Record<string, unknown>;
  
  const createAttemptInfo = (data: unknown): AssessmentAttemptInfo | null => {
    if (!data || typeof data !== "object") return null;
    const d = data as Record<string, unknown>;
    
    return {
      status: (d.completed ? "completed" : d.started ? "in_progress" : "scheduled") as AssessmentStatus,
      score: typeof d.score === "number" ? d.score : null,
      attempts: typeof d.attempts === "number" ? d.attempts : 1,
      lastAttemptAt: typeof d.lastAttemptAt === "string" ? d.lastAttemptAt : null,
      completedAt: typeof d.completedAt === "string" ? d.completedAt : null,
      verifiedAt: null,
    };
  };

  return {
    aptitude: createAttemptInfo(p.aptitude),
    psychometric: createAttemptInfo(p.psychometric),
    gk: createAttemptInfo(p.gk),
    final_role: createAttemptInfo(p.final_role),
  };
}

export function batchMapStudents(legacyStudents: LegacyStudentRegistration[]): CanonicalStudent[] {
  return legacyStudents.map(mapLegacyStudentToCanonical);
}

export function batchMapEmployers(legacyEmployers: LegacyEmployer[]): CanonicalEmployer[] {
  return legacyEmployers.map(mapLegacyEmployerToCanonical);
}

export function batchMapJobs(legacyJobs: LegacyJobPosting[]): CanonicalJob[] {
  return legacyJobs.map(mapLegacyJobToCanonical);
}

export function batchMapAssessments(legacyAssessments: LegacyAssessment[]): CanonicalAssessment[] {
  return legacyAssessments.map(mapLegacyAssessmentToCanonical);
}

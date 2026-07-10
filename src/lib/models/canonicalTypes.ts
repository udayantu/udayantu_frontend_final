/**
 * Canonical Data Models & Status Definitions
 * UdaYantu Career Development Platform
 * 
 * This file defines the single source of truth for all entity statuses
 * and data models used across Student, Employer, and Admin dashboards.
 */

export const STUDENT_STATUSES = [
  "signup",        // Initial registration started
  "signin",        // Returning user signed in
  "payment",       // Payment initiated/pending
  "enrolled",      // Payment completed, enrolled in program
  "in_training",   // Actively taking courses/assessments
  "ready",         // Training complete, ready for placement
  "interviewing",  // In active interview process
  "offered",       // Received job offer
  "joined",        // Accepted offer, started job
  "alumni",        // Program graduate (post 6 months)
] as const;

export type StudentStatus = typeof STUDENT_STATUSES[number];

export const JOB_CANDIDATE_STATUSES = [
  "new",           // Fresh candidate submission
  "shortlisted",   // Employer shortlisted
  "interview",     // Interview scheduled/in progress
  "offered",       // Offer extended
  "joined",        // Candidate joined
  "rejected",      // Rejected at any stage
  "withdrawn",     // Candidate withdrew
] as const;

export type JobCandidateStatus = typeof JOB_CANDIDATE_STATUSES[number];

export const ASSESSMENT_STATUSES = [
  "scheduled",     // Assessment scheduled for student
  "in_progress",   // Student is taking the assessment
  "completed",     // Assessment finished, awaiting verification
  "verified",      // Results verified and finalized
  "flagged",       // Requires review (potential issues)
] as const;

export type AssessmentStatus = typeof ASSESSMENT_STATUSES[number];

export const OFFER_STATUSES = [
  "pending",       // Offer sent, awaiting response
  "accepted",      // Candidate accepted
  "rejected",      // Candidate declined
  "expired",       // Offer expired without response
  "joined",        // Candidate joined after accepting
  "revoked",       // Offer withdrawn by employer
] as const;

export type OfferStatus = typeof OFFER_STATUSES[number];

export interface CanonicalStudent {
  id: string;
  userId: string | null;
  fullName: string;
  email: string;
  phone: string;
  status: StudentStatus;
  paymentStatus: "unpaid" | "pending" | "paid" | "refunded";
  qualification: string | null;
  desiredRole: string;
  finalRole: string | null;
  state: string | null;
  district: string | null;
  location: string | null;
  enrolledAt: string | null;
  trainingStartedAt: string | null;
  trainingCompletedAt: string | null;
  readyAt: string | null;
  placedAt: string | null;
  joinedAt: string | null;
  assessmentsProgress: AssessmentProgress | null;
  cohortMonth: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentProgress {
  aptitude: AssessmentAttemptInfo | null;
  psychometric: AssessmentAttemptInfo | null;
  gk: AssessmentAttemptInfo | null;
  final_role: AssessmentAttemptInfo | null;
}

export interface AssessmentAttemptInfo {
  status: AssessmentStatus;
  score: number | null;
  attempts: number;
  lastAttemptAt: string | null;
  completedAt: string | null;
  verifiedAt: string | null;
}

export interface CanonicalJob {
  id: string;
  companyId: string;
  title: string;
  skills: string[];
  tools: string[];
  languageLevel: "beginner" | "intermediate" | "advanced";
  location: string;
  salaryBandMin: number;
  salaryBandMax: number;
  workType: "full-time" | "part-time" | "contract" | "internship";
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export interface CanonicalCandidate {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  jobId: string;
  status: JobCandidateStatus;
  currentStage: string;
  fitScore: number | null;
  appliedAt: string;
  shortlistedAt: string | null;
  interviewScheduledAt: string | null;
  offeredAt: string | null;
  joinedAt: string | null;
  rejectedAt: string | null;
  notes: string | null;
  rating: number | null;
}

export interface CanonicalAssessment {
  id: string;
  studentId: string;
  type: "aptitude" | "psychometric" | "gk" | "final_role";
  status: AssessmentStatus;
  score: number | null;
  questions: unknown | null;
  answers: unknown | null;
  analysis: unknown | null;
  attemptNumber: number;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  flagReason: string | null;
  durationSeconds: number | null;
  recommendedRole: string | null;
  createdAt: string;
}

export interface CanonicalOffer {
  id: string;
  candidateId: string;
  jobId: string;
  employerId: string;
  studentId: string;
  status: OfferStatus;
  salary: number;
  joiningDate: string | null;
  expiresAt: string | null;
  offeredAt: string;
  acceptedAt: string | null;
  joinedAt: string | null;
  rejectedAt: string | null;
  revokedAt: string | null;
  notes: string | null;
}

export interface CanonicalEmployer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  designation: string | null;
  rolesNeeded: string[] | null;
  toolsStack: string | null;
  cohortSizeEstimate: number | null;
  hiringTimeline: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export const STATUS_TRANSITIONS: Record<string, {
  from: readonly string[];
  to: readonly string[];
  autoTrigger?: string;
}> = {
  "student.signup_to_payment": {
    from: ["signup", "signin"],
    to: ["payment"],
    autoTrigger: "payment_initiated",
  },
  "student.payment_to_enrolled": {
    from: ["payment"],
    to: ["enrolled"],
    autoTrigger: "payment_completed",
  },
  "student.enrolled_to_training": {
    from: ["enrolled"],
    to: ["in_training"],
    autoTrigger: "training_started",
  },
  "student.training_to_ready": {
    from: ["in_training"],
    to: ["ready"],
    autoTrigger: "training_completed",
  },
  "student.ready_to_interviewing": {
    from: ["ready"],
    to: ["interviewing"],
    autoTrigger: "interview_scheduled",
  },
  "student.interviewing_to_offered": {
    from: ["interviewing"],
    to: ["offered"],
    autoTrigger: "offer_extended",
  },
  "student.offered_to_joined": {
    from: ["offered"],
    to: ["joined"],
    autoTrigger: "candidate_joined",
  },
  "student.joined_to_alumni": {
    from: ["joined"],
    to: ["alumni"],
    autoTrigger: "alumni_milestone",
  },
  "candidate.new_to_shortlisted": {
    from: ["new"],
    to: ["shortlisted"],
  },
  "candidate.shortlisted_to_interview": {
    from: ["shortlisted"],
    to: ["interview"],
  },
  "candidate.interview_to_offered": {
    from: ["interview"],
    to: ["offered"],
  },
  "candidate.offered_to_joined": {
    from: ["offered"],
    to: ["joined"],
  },
  "assessment.scheduled_to_progress": {
    from: ["scheduled"],
    to: ["in_progress"],
    autoTrigger: "assessment_started",
  },
  "assessment.progress_to_completed": {
    from: ["in_progress"],
    to: ["completed"],
    autoTrigger: "assessment_submitted",
  },
  "assessment.completed_to_verified": {
    from: ["completed"],
    to: ["verified"],
    autoTrigger: "assessment_verified",
  },
};

export function isValidTransition(
  entityType: "student" | "candidate" | "assessment",
  fromStatus: string,
  toStatus: string
): boolean {
  const transitionKey = `${entityType}.${fromStatus}_to_${toStatus}`;
  const transition = STATUS_TRANSITIONS[transitionKey];
  
  if (transition) {
    return transition.from.includes(fromStatus) && transition.to.includes(toStatus);
  }
  
  for (const [key, value] of Object.entries(STATUS_TRANSITIONS)) {
    if (key.startsWith(`${entityType}.`) && 
        value.from.includes(fromStatus) && 
        value.to.includes(toStatus)) {
      return true;
    }
  }
  
  return false;
}

export function getNextStatuses(
  entityType: "student" | "candidate" | "assessment",
  currentStatus: string
): string[] {
  const validNext: string[] = [];
  
  for (const [key, value] of Object.entries(STATUS_TRANSITIONS)) {
    if (key.startsWith(`${entityType}.`) && value.from.includes(currentStatus)) {
      validNext.push(...value.to);
    }
  }
  
  return [...new Set(validNext)];
}

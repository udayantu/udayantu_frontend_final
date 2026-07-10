export type NotificationChannel = 'whatsapp' | 'email' | 'sms' | 'in_app';
export type NotificationPriority = 'urgent' | 'high' | 'normal' | 'low';
export type RecipientRole = 'student' | 'employer' | 'ss' | 'cs' | 'admin' | 'content' | 'mentor';

export interface NotificationRoute {
  sourceRole: RecipientRole;
  targetRole: RecipientRole;
  mediator?: RecipientRole;
  channels: NotificationChannel[];
  requiresApproval: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: NotificationChannel;
  subject?: {
    en: string;
    hi: string;
  };
  body: {
    en: string;
    hi: string;
  };
  variables: string[];
  lowBandwidth: boolean;
}

export interface NotificationPayload {
  templateId: string;
  recipientId: string;
  recipientRole: RecipientRole;
  recipientPhone?: string;
  recipientEmail?: string;
  language: 'en' | 'hi';
  variables: Record<string, string>;
  priority: NotificationPriority;
  metadata?: Record<string, unknown>;
}

export interface NotificationLog {
  id: string;
  templateId: string;
  recipientId: string;
  recipientRole: RecipientRole;
  senderRole: RecipientRole;
  channel: NotificationChannel;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'blocked';
  blockedReason?: string;
  sentAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export type PacketType = 'candidate_ready' | 'interview_outcome' | 'assessment_result';
export type PacketStatus = 'draft' | 'pending_review' | 'approved' | 'sent' | 'received' | 'actioned';

export interface CandidateReadyPacket {
  type: 'candidate_ready';
  id: string;
  studentId: string;
  studentName: string;
  createdBy: string;
  createdByRole: 'ss';
  targetRoles: ('cs' | 'admin')[];
  status: PacketStatus;
  resume: {
    url: string;
    lastUpdated: string;
    verified: boolean;
  };
  verifiedScores: {
    assessment: string;
    score: number;
    percentile?: number;
    verifiedAt: string;
  }[];
  clips: {
    type: 'intro' | 'technical' | 'situational';
    url: string;
    duration: number;
    recordedAt: string;
  }[];
  attendance: {
    totalSessions: number;
    attendedSessions: number;
    percentage: number;
  };
  mentorSummary: {
    mentorId: string;
    mentorName: string;
    strengths: string[];
    areasForGrowth: string[];
    recommendation: string;
    submittedAt: string;
  };
  readinessScore: number;
  createdAt: string;
  sentAt?: string;
  receivedAt?: string;
}

export interface InterviewOutcomePacket {
  type: 'interview_outcome';
  id: string;
  studentId: string;
  studentName: string;
  employerId: string;
  employerName: string;
  interviewId: string;
  createdBy: string;
  createdByRole: 'cs';
  targetRoles: ('ss' | 'admin')[];
  status: PacketStatus;
  feedback: {
    technicalScore: number;
    communicationScore: number;
    cultureFitScore: number;
    overallScore: number;
    strengths: string[];
    improvements: string[];
    notes: string;
  };
  reskillTags: {
    skill: string;
    priority: 'high' | 'medium' | 'low';
    suggestedResources?: string[];
  }[];
  nextSteps: {
    action: 'selected' | 'rejected' | 'next_round' | 'on_hold' | 'reskill';
    details: string;
    deadline?: string;
  };
  createdAt: string;
  sentAt?: string;
  receivedAt?: string;
}

export interface AssessmentResultPacket {
  type: 'assessment_result';
  id: string;
  studentId: string;
  studentName: string;
  assessmentId: string;
  assessmentName: string;
  createdBy: string;
  createdByRole: 'content';
  targetRoles: ('ss' | 'admin')[];
  status: PacketStatus;
  breakdown: {
    section: string;
    maxScore: number;
    score: number;
    percentage: number;
    timeSpent: number;
  }[];
  flags: {
    type: 'low_score' | 'incomplete' | 'time_exceeded' | 'suspected_cheating' | 'technical_issue';
    severity: 'critical' | 'warning' | 'info';
    description: string;
  }[];
  practicePlan: {
    topic: string;
    resources: { title: string; url: string; type: 'video' | 'article' | 'quiz' }[];
    estimatedHours: number;
    priority: number;
  }[];
  overallScore: number;
  passed: boolean;
  createdAt: string;
  sentAt?: string;
  receivedAt?: string;
}

export type HandoffPacket = CandidateReadyPacket | InterviewOutcomePacket | AssessmentResultPacket;

export const ROUTING_RULES: NotificationRoute[] = [
  { sourceRole: 'student', targetRole: 'ss', channels: ['whatsapp', 'in_app'], requiresApproval: false },
  { sourceRole: 'student', targetRole: 'employer', mediator: 'cs', channels: ['in_app'], requiresApproval: true },
  { sourceRole: 'employer', targetRole: 'cs', channels: ['email', 'in_app'], requiresApproval: false },
  { sourceRole: 'employer', targetRole: 'student', mediator: 'cs', channels: ['in_app'], requiresApproval: true },
  { sourceRole: 'ss', targetRole: 'cs', channels: ['in_app', 'email'], requiresApproval: false },
  { sourceRole: 'ss', targetRole: 'admin', channels: ['in_app'], requiresApproval: false },
  { sourceRole: 'cs', targetRole: 'ss', channels: ['in_app', 'email'], requiresApproval: false },
  { sourceRole: 'cs', targetRole: 'admin', channels: ['in_app'], requiresApproval: false },
  { sourceRole: 'content', targetRole: 'ss', channels: ['in_app'], requiresApproval: false },
  { sourceRole: 'content', targetRole: 'admin', channels: ['in_app'], requiresApproval: false },
  { sourceRole: 'mentor', targetRole: 'ss', channels: ['in_app'], requiresApproval: false },
  { sourceRole: 'admin', targetRole: 'student', mediator: 'ss', channels: ['in_app'], requiresApproval: false },
  { sourceRole: 'admin', targetRole: 'employer', mediator: 'cs', channels: ['in_app'], requiresApproval: false },
];

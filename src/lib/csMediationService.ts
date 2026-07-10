import { sendNotification } from './notificationRouter';
import type { NotificationPayload, RecipientRole } from '@/types/notifications';

const CS_ACTIONS_KEY = 'udayantu_cs_pending_actions';
const CS_ESCALATIONS_KEY = 'udayantu_cs_escalations';

export type CSActionType = 
  | 'schedule_interview'
  | 'send_offer'
  | 'share_candidate'
  | 'request_feedback'
  | 'reactivate_candidate';

export type CSActionStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface CSPendingAction {
  id: string;
  type: CSActionType;
  employerId: string;
  employerName: string;
  studentId: string;
  studentName?: string;
  details: Record<string, unknown>;
  status: CSActionStatus;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  csNotes?: string;
  slaDeadline: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface CSEscalation {
  id: string;
  employerId: string;
  employerName: string;
  reason: string;
  urgency: 'normal' | 'urgent';
  createdAt: string;
  status: 'open' | 'in_progress' | 'resolved';
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
}

export interface MediatedCandidate {
  id: string;
  displayName: string;
  fitScore: number;
  skills: string[];
  evidenceLinks: {
    skillClip?: string;
    voiceSample?: string;
  };
  mentorSummary: string;
  readinessLevel: 'not_ready' | 'partially_ready' | 'ready' | 'highly_ready';
  city: string;
  degree: string;
  pipelineStage: 'new' | 'shortlisted' | 'interview' | 'offered' | 'joined' | 'rejected';
  stageUpdatedAt: string;
  agingDays: number;
  slaStatus: 'on_track' | 'at_risk' | 'breached';
}

const translations = {
  en: {
    scheduleInterview: 'Schedule Interview',
    sendOffer: 'Send Offer',
    shareCandidate: 'Share Candidate',
    requestFeedback: 'Request Feedback',
    reactivateCandidate: 'Reactivate Candidate',
    pending: 'Pending CS Approval',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    escalationSent: 'Escalation sent to Customer Success',
    actionQueued: 'Action queued for CS approval',
    csWillContact: 'Customer Success will contact you shortly',
    noDirectContact: 'Direct student contact not permitted',
  },
  hi: {
    scheduleInterview: 'इंटरव्यू शेड्यूल करें',
    sendOffer: 'ऑफर भेजें',
    shareCandidate: 'कैंडिडेट शेयर करें',
    requestFeedback: 'फीडबैक मांगें',
    reactivateCandidate: 'कैंडिडेट को रीएक्टिवेट करें',
    pending: 'CS अनुमोदन बाकी',
    approved: 'अनुमोदित',
    rejected: 'अस्वीकृत',
    completed: 'पूर्ण',
    escalationSent: 'Customer Success को एस्केलेशन भेजा गया',
    actionQueued: 'CS अनुमोदन के लिए कतार में',
    csWillContact: 'Customer Success जल्द ही संपर्क करेगी',
    noDirectContact: 'सीधा स्टूडेंट संपर्क अनुमति नहीं है',
  },
};

function getStoredActions(): CSPendingAction[] {
  try {
    const stored = localStorage.getItem(CS_ACTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveActions(actions: CSPendingAction[]): void {
  localStorage.setItem(CS_ACTIONS_KEY, JSON.stringify(actions));
}

function getStoredEscalations(): CSEscalation[] {
  try {
    const stored = localStorage.getItem(CS_ESCALATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveEscalations(escalations: CSEscalation[]): void {
  localStorage.setItem(CS_ESCALATIONS_KEY, JSON.stringify(escalations));
}

function generateId(): string {
  return `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculateSLADeadline(priority: CSPendingAction['priority']): string {
  const now = new Date();
  const hoursToAdd = priority === 'urgent' ? 4 : priority === 'high' ? 12 : priority === 'medium' ? 24 : 48;
  now.setHours(now.getHours() + hoursToAdd);
  return now.toISOString();
}

export function requestCSAction(
  type: CSActionType,
  employerId: string,
  employerName: string,
  studentId: string,
  details: Record<string, unknown>,
  priority: CSPendingAction['priority'] = 'medium'
): { success: boolean; actionId: string; message: string } {
  const action: CSPendingAction = {
    id: generateId(),
    type,
    employerId,
    employerName,
    studentId,
    details,
    status: 'pending',
    createdAt: new Date().toISOString(),
    slaDeadline: calculateSLADeadline(priority),
    priority,
  };

  const actions = getStoredActions();
  actions.push(action);
  saveActions(actions);

  sendNotification('employer', {
    recipientId: 'cs_team',
    recipientRole: 'cs',
    templateId: 'cs_action_required',
    language: 'hi',
    variables: {
      actionType: type,
      employerName,
      priorityLevel: String(priority),
    },
    priority: priority === 'urgent' ? 'high' : 'normal',
  }, 'in_app');

  return {
    success: true,
    actionId: action.id,
    message: translations.en.actionQueued,
  };
}

export function processCSAction(
  actionId: string,
  csUserId: string,
  approved: boolean,
  notes?: string
): { success: boolean; error?: string } {
  const actions = getStoredActions();
  const actionIndex = actions.findIndex(a => a.id === actionId);

  if (actionIndex === -1) {
    return { success: false, error: 'Action not found' };
  }

  const action = actions[actionIndex];
  action.status = approved ? 'approved' : 'rejected';
  action.processedAt = new Date().toISOString();
  action.processedBy = csUserId;
  action.csNotes = notes;

  actions[actionIndex] = action;
  saveActions(actions);

  sendNotification('cs', {
    recipientId: action.employerId,
    recipientRole: 'employer',
    templateId: approved ? 'action_approved' : 'action_rejected',
    language: 'hi',
    variables: {
      actionType: action.type,
      notes: notes || '',
    },
    priority: 'normal',
  }, 'in_app');

  return { success: true };
}

export function escalateToCS(
  employerId: string,
  employerName: string,
  reason: string,
  urgency: 'normal' | 'urgent' = 'normal'
): { success: boolean; escalationId: string } {
  const escalation: CSEscalation = {
    id: generateId(),
    employerId,
    employerName,
    reason,
    urgency,
    createdAt: new Date().toISOString(),
    status: 'open',
  };

  const escalations = getStoredEscalations();
  escalations.push(escalation);
  saveEscalations(escalations);

  sendNotification('employer', {
    recipientId: 'cs_team',
    recipientRole: 'cs',
    templateId: 'cs_escalation',
    language: 'hi',
    variables: {
      employerName,
      reason,
      urgency,
    },
    priority: urgency === 'urgent' ? 'high' : 'normal',
  }, 'whatsapp');

  return {
    success: true,
    escalationId: escalation.id,
  };
}

export function getPendingActions(employerId?: string): CSPendingAction[] {
  const actions = getStoredActions();
  if (employerId) {
    return actions.filter(a => a.employerId === employerId);
  }
  return actions;
}

export function getCSEscalations(status?: CSEscalation['status']): CSEscalation[] {
  const escalations = getStoredEscalations();
  if (status) {
    return escalations.filter(e => e.status === status);
  }
  return escalations;
}

export function resolveEscalation(
  escalationId: string,
  csUserId: string,
  resolution: string
): { success: boolean } {
  const escalations = getStoredEscalations();
  const index = escalations.findIndex(e => e.id === escalationId);

  if (index === -1) {
    return { success: false };
  }

  escalations[index].status = 'resolved';
  escalations[index].resolvedAt = new Date().toISOString();
  escalations[index].resolvedBy = csUserId;
  escalations[index].resolution = resolution;

  saveEscalations(escalations);

  return { success: true };
}

export function maskStudentPII(student: {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}): { displayId: string; displayName: string } {
  const displayId = student.id.replace(/^(.{4}).*(.{4})$/, '$1****$2');
  const nameParts = student.name.split(' ');
  const displayName = nameParts.length > 1
    ? `${nameParts[0]} ${nameParts[1].charAt(0)}.`
    : `${student.name.substring(0, 4)}...`;

  return { displayId, displayName };
}

export function getMediatedCandidates(employerId: string): MediatedCandidate[] {
  const demoData: MediatedCandidate[] = [
    {
      id: 'cand_001',
      displayName: 'Rahul S.',
      fitScore: 85,
      skills: ['Communication', 'Hindi', 'Customer Service'],
      evidenceLinks: {
        skillClip: '/evidence/clip_001.mp4',
        voiceSample: '/evidence/voice_001.mp3',
      },
      mentorSummary: 'Strong communicator, needs minor improvement in confidence during video calls.',
      readinessLevel: 'ready',
      city: 'Lucknow',
      degree: 'B.Com',
      pipelineStage: 'new',
      stageUpdatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      agingDays: 2,
      slaStatus: 'on_track',
    },
    {
      id: 'cand_002',
      displayName: 'Priya M.',
      fitScore: 92,
      skills: ['English', 'Data Entry', 'MS Office'],
      evidenceLinks: {
        skillClip: '/evidence/clip_002.mp4',
      },
      mentorSummary: 'Excellent attention to detail. Ready for immediate placement.',
      readinessLevel: 'highly_ready',
      city: 'Patna',
      degree: 'BCA',
      pipelineStage: 'shortlisted',
      stageUpdatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      agingDays: 5,
      slaStatus: 'at_risk',
    },
    {
      id: 'cand_003',
      displayName: 'Amit K.',
      fitScore: 78,
      skills: ['Sales', 'Hindi', 'Negotiation'],
      evidenceLinks: {
        voiceSample: '/evidence/voice_003.mp3',
      },
      mentorSummary: 'Good sales aptitude. Completing final training module.',
      readinessLevel: 'partially_ready',
      city: 'Jaipur',
      degree: 'BA',
      pipelineStage: 'interview',
      stageUpdatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      agingDays: 8,
      slaStatus: 'breached',
    },
    {
      id: 'cand_004',
      displayName: 'Sneha R.',
      fitScore: 88,
      skills: ['Accounting', 'Tally', 'Excel'],
      evidenceLinks: {
        skillClip: '/evidence/clip_004.mp4',
        voiceSample: '/evidence/voice_004.mp3',
      },
      mentorSummary: 'Strong in accounting fundamentals. Well prepared for finance roles.',
      readinessLevel: 'ready',
      city: 'Bhopal',
      degree: 'B.Com',
      pipelineStage: 'offered',
      stageUpdatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      agingDays: 1,
      slaStatus: 'on_track',
    },
    {
      id: 'cand_005',
      displayName: 'Vikram P.',
      fitScore: 95,
      skills: ['Technical Support', 'English', 'Problem Solving'],
      evidenceLinks: {
        skillClip: '/evidence/clip_005.mp4',
        voiceSample: '/evidence/voice_005.mp3',
      },
      mentorSummary: 'Exceptional problem-solving skills. Top performer in cohort.',
      readinessLevel: 'highly_ready',
      city: 'Indore',
      degree: 'B.Tech',
      pipelineStage: 'joined',
      stageUpdatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      agingDays: 15,
      slaStatus: 'on_track',
    },
  ];

  return demoData;
}

export function updateCandidatePipelineStage(
  employerId: string,
  candidateId: string,
  newStage: MediatedCandidate['pipelineStage'],
  feedback?: {
    interviewScore?: number;
    communicationScore?: number;
    technicalScore?: number;
    overallFit?: number;
    reskillTags?: string[];
    nextSteps?: string;
    notes?: string;
  }
): { success: boolean; requiresCSAction?: boolean; actionId?: string } {
  if (newStage === 'interview' || newStage === 'offered' || newStage === 'joined') {
    const actionType: CSActionType = newStage === 'interview' 
      ? 'schedule_interview' 
      : newStage === 'offered' 
        ? 'send_offer'
        : 'share_candidate';
    
    const result = requestCSAction(
      actionType,
      employerId,
      'Employer',
      candidateId,
      { newStage, feedback, action: newStage === 'joined' ? 'confirm_joining' : undefined },
      newStage === 'joined' ? 'high' : 'medium'
    );
    return { success: true, requiresCSAction: true, actionId: result.actionId };
  }

  if (newStage === 'rejected' && feedback) {
    console.log('Interview outcome packet would be created for CS to send:', {
      studentId: candidateId,
      employerId,
      feedback,
    });
  }

  return { success: true };
}

export function getCSActionStats(): {
  pending: number;
  approved: number;
  rejected: number;
  avgProcessingTime: number;
  slaBreaches: number;
} {
  const actions = getStoredActions();
  const now = new Date();

  const pending = actions.filter(a => a.status === 'pending').length;
  const approved = actions.filter(a => a.status === 'approved').length;
  const rejected = actions.filter(a => a.status === 'rejected').length;

  const processedActions = actions.filter(a => a.processedAt);
  const avgProcessingTime = processedActions.length > 0
    ? processedActions.reduce((sum, a) => {
        const created = new Date(a.createdAt);
        const processed = new Date(a.processedAt!);
        return sum + (processed.getTime() - created.getTime()) / (1000 * 60 * 60);
      }, 0) / processedActions.length
    : 0;

  const slaBreaches = actions.filter(a => {
    if (a.status !== 'pending') return false;
    return new Date(a.slaDeadline) < now;
  }).length;

  return {
    pending,
    approved,
    rejected,
    avgProcessingTime: Math.round(avgProcessingTime * 10) / 10,
    slaBreaches,
  };
}

export { translations as csMediationTranslations };

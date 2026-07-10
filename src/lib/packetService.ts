import type {
  CandidateReadyPacket,
  InterviewOutcomePacket,
  AssessmentResultPacket,
  HandoffPacket,
  PacketStatus,
} from '@/types/notifications';
import { sendNotification } from './notificationRouter';

const PACKETS_STORAGE_KEY = 'udayantu_handoff_packets';

function generatePacketId(type: string): string {
  return `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getStoredPackets(): HandoffPacket[] {
  try {
    const stored = localStorage.getItem(PACKETS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePackets(packets: HandoffPacket[]): void {
  localStorage.setItem(PACKETS_STORAGE_KEY, JSON.stringify(packets));
}

function savePacket(packet: HandoffPacket): void {
  const packets = getStoredPackets();
  const existingIndex = packets.findIndex(p => p.id === packet.id);
  if (existingIndex >= 0) {
    packets[existingIndex] = packet;
  } else {
    packets.unshift(packet);
  }
  savePackets(packets);
}

export interface CreateCandidateReadyInput {
  studentId: string;
  studentName: string;
  createdBy: string;
  resume: CandidateReadyPacket['resume'];
  verifiedScores: CandidateReadyPacket['verifiedScores'];
  clips: CandidateReadyPacket['clips'];
  attendance: CandidateReadyPacket['attendance'];
  mentorSummary: CandidateReadyPacket['mentorSummary'];
}

export function createCandidateReadyPacket(input: CreateCandidateReadyInput): CandidateReadyPacket {
  const readinessScore = calculateReadinessScore(input);

  const packet: CandidateReadyPacket = {
    type: 'candidate_ready',
    id: generatePacketId('crp'),
    studentId: input.studentId,
    studentName: input.studentName,
    createdBy: input.createdBy,
    createdByRole: 'ss',
    targetRoles: ['cs', 'admin'],
    status: 'draft',
    resume: input.resume,
    verifiedScores: input.verifiedScores,
    clips: input.clips,
    attendance: input.attendance,
    mentorSummary: input.mentorSummary,
    readinessScore,
    createdAt: new Date().toISOString(),
  };

  savePacket(packet);
  return packet;
}

function calculateReadinessScore(input: CreateCandidateReadyInput): number {
  let score = 0;
  let weights = 0;

  if (input.resume.verified) {
    score += 20;
  }
  weights += 20;

  if (input.verifiedScores.length > 0) {
    const avgScore = input.verifiedScores.reduce((sum, s) => sum + s.score, 0) / input.verifiedScores.length;
    score += (avgScore / 100) * 25;
  }
  weights += 25;

  if (input.attendance.percentage >= 90) {
    score += 20;
  } else if (input.attendance.percentage >= 75) {
    score += 15;
  } else if (input.attendance.percentage >= 60) {
    score += 10;
  }
  weights += 20;

  if (input.clips.length >= 2) {
    score += 15;
  } else if (input.clips.length >= 1) {
    score += 10;
  }
  weights += 15;

  if (input.mentorSummary.recommendation) {
    score += 20;
  }
  weights += 20;

  return Math.round((score / weights) * 100);
}

export interface CreateInterviewOutcomeInput {
  studentId: string;
  studentName: string;
  employerId: string;
  employerName: string;
  interviewId: string;
  createdBy: string;
  feedback: InterviewOutcomePacket['feedback'];
  reskillTags: InterviewOutcomePacket['reskillTags'];
  nextSteps: InterviewOutcomePacket['nextSteps'];
}

export function createInterviewOutcomePacket(input: CreateInterviewOutcomeInput): InterviewOutcomePacket {
  const packet: InterviewOutcomePacket = {
    type: 'interview_outcome',
    id: generatePacketId('iop'),
    studentId: input.studentId,
    studentName: input.studentName,
    employerId: input.employerId,
    employerName: input.employerName,
    interviewId: input.interviewId,
    createdBy: input.createdBy,
    createdByRole: 'cs',
    targetRoles: ['ss', 'admin'],
    status: 'draft',
    feedback: input.feedback,
    reskillTags: input.reskillTags,
    nextSteps: input.nextSteps,
    createdAt: new Date().toISOString(),
  };

  savePacket(packet);
  return packet;
}

export interface CreateAssessmentResultInput {
  studentId: string;
  studentName: string;
  assessmentId: string;
  assessmentName: string;
  createdBy: string;
  breakdown: AssessmentResultPacket['breakdown'];
  flags: AssessmentResultPacket['flags'];
  practicePlan: AssessmentResultPacket['practicePlan'];
  overallScore: number;
  passed: boolean;
}

export function createAssessmentResultPacket(input: CreateAssessmentResultInput): AssessmentResultPacket {
  const packet: AssessmentResultPacket = {
    type: 'assessment_result',
    id: generatePacketId('arp'),
    studentId: input.studentId,
    studentName: input.studentName,
    assessmentId: input.assessmentId,
    assessmentName: input.assessmentName,
    createdBy: input.createdBy,
    createdByRole: 'content',
    targetRoles: ['ss', 'admin'],
    status: 'draft',
    breakdown: input.breakdown,
    flags: input.flags,
    practicePlan: input.practicePlan,
    overallScore: input.overallScore,
    passed: input.passed,
    createdAt: new Date().toISOString(),
  };

  savePacket(packet);
  return packet;
}

export async function sendPacket(
  packetId: string,
  senderRole: 'ss' | 'cs' | 'content',
  language: 'en' | 'hi' = 'hi'
): Promise<{ success: boolean; error?: string }> {
  const packets = getStoredPackets();
  const packet = packets.find(p => p.id === packetId);

  if (!packet) {
    return { success: false, error: 'Packet not found' };
  }

  if (packet.createdByRole !== senderRole) {
    return { success: false, error: 'Unauthorized: Only creator can send packet' };
  }

  let templateId: string;
  let variables: Record<string, string>;

  switch (packet.type) {
    case 'candidate_ready':
      templateId = 'candidate_ready_ss_to_cs';
      variables = {
        studentName: packet.studentName,
        readinessScore: packet.readinessScore.toString(),
        attendance: packet.attendance.percentage.toString(),
        assessmentSummary: packet.verifiedScores.map(s => `${s.assessment}: ${s.score}%`).join(', ') || 'N/A',
        mentorRecommendation: packet.mentorSummary.recommendation,
        packetLink: `/admin/packets/${packet.id}`,
      };
      break;

    case 'interview_outcome':
      templateId = 'interview_outcome_cs_to_ss';
      variables = {
        studentName: packet.studentName,
        companyName: packet.employerName,
        outcome: packet.nextSteps.action,
        techScore: packet.feedback.technicalScore.toString(),
        commScore: packet.feedback.communicationScore.toString(),
        nextSteps: packet.nextSteps.details,
        reskillTags: packet.reskillTags.map(t => t.skill).join(', ') || 'None',
        packetLink: `/admin/packets/${packet.id}`,
      };
      break;

    case 'assessment_result':
      templateId = 'assessment_result_content_to_ss';
      variables = {
        studentName: packet.studentName,
        assessmentName: packet.assessmentName,
        score: packet.overallScore.toString(),
        status: packet.passed ? (language === 'hi' ? 'पास' : 'Passed') : (language === 'hi' ? 'फेल' : 'Failed'),
        flags: packet.flags.map(f => f.description).join(', ') || 'None',
        packetLink: `/admin/packets/${packet.id}`,
      };
      break;
  }

  for (const targetRole of packet.targetRoles) {
    await sendNotification(senderRole, {
      templateId,
      recipientId: `${targetRole}_team`,
      recipientRole: targetRole,
      language,
      variables,
      priority: 'high',
    });
  }

  packet.status = 'sent';
  packet.sentAt = new Date().toISOString();
  savePacket(packet);

  return { success: true };
}

export function updatePacketStatus(packetId: string, status: PacketStatus): boolean {
  const packets = getStoredPackets();
  const packet = packets.find(p => p.id === packetId);
  if (!packet) return false;

  packet.status = status;
  if (status === 'received') {
    packet.receivedAt = new Date().toISOString();
  }
  savePacket(packet);
  return true;
}

export function getPackets(filters?: {
  type?: HandoffPacket['type'];
  status?: PacketStatus;
  targetRole?: 'ss' | 'cs' | 'admin' | 'content';
  createdByRole?: 'ss' | 'cs' | 'content';
  viewerRole?: 'ss' | 'cs' | 'admin' | 'content';
  studentId?: string;
  limit?: number;
}): HandoffPacket[] {
  let packets = getStoredPackets();

  if (filters?.type) {
    packets = packets.filter(p => p.type === filters.type);
  }
  if (filters?.status) {
    packets = packets.filter(p => p.status === filters.status);
  }
  if (filters?.viewerRole) {
    const role = filters.viewerRole;
    packets = packets.filter(p => 
      p.createdByRole === role || 
      (p.targetRoles as string[]).includes(role)
    );
  } else if (filters?.targetRole) {
    const role = filters.targetRole;
    packets = packets.filter(p => (p.targetRoles as string[]).includes(role));
  }
  if (filters?.createdByRole) {
    packets = packets.filter(p => p.createdByRole === filters.createdByRole);
  }
  if (filters?.studentId) {
    packets = packets.filter(p => p.studentId === filters.studentId);
  }
  if (filters?.limit) {
    packets = packets.slice(0, filters.limit);
  }

  return packets;
}

export function getPacketById(id: string): HandoffPacket | undefined {
  return getStoredPackets().find(p => p.id === id);
}

export function getPacketStats(): {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  pending: number;
} {
  const packets = getStoredPackets();
  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  packets.forEach(p => {
    byType[p.type] = (byType[p.type] || 0) + 1;
    byStatus[p.status] = (byStatus[p.status] || 0) + 1;
  });

  return {
    total: packets.length,
    byType,
    byStatus,
    pending: (byStatus['draft'] || 0) + (byStatus['pending_review'] || 0),
  };
}

export function clearPackets(): void {
  localStorage.removeItem(PACKETS_STORAGE_KEY);
}

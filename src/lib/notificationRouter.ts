import type {
  NotificationChannel,
  NotificationPayload,
  NotificationLog,
  NotificationRoute,
  RecipientRole,
  ROUTING_RULES,
} from '@/types/notifications';
import { getTemplate, renderTemplate, getWhatsAppUrl } from './notificationTemplates';

const STORAGE_KEY = 'udayantu_notification_logs';

function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getNotificationLogs(): NotificationLog[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveNotificationLog(log: NotificationLog): void {
  const logs = getNotificationLogs();
  logs.unshift(log);
  if (logs.length > 500) logs.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function findRoute(sourceRole: RecipientRole, targetRole: RecipientRole): NotificationRoute | null {
  const { ROUTING_RULES } = require('@/types/notifications');
  return ROUTING_RULES.find(
    (r: NotificationRoute) => r.sourceRole === sourceRole && r.targetRole === targetRole
  ) || null;
}

export function isDirectPathBlocked(sourceRole: RecipientRole, targetRole: RecipientRole): boolean {
  const blockedPairs: [RecipientRole, RecipientRole][] = [
    ['student', 'employer'],
    ['employer', 'student'],
  ];
  return blockedPairs.some(([s, t]) => s === sourceRole && t === targetRole);
}

export function getMediator(sourceRole: RecipientRole, targetRole: RecipientRole): RecipientRole | null {
  const route = findRoute(sourceRole, targetRole);
  return route?.mediator || null;
}

export interface SendNotificationResult {
  success: boolean;
  logId?: string;
  blocked?: boolean;
  blockedReason?: string;
  whatsappUrl?: string;
}

export async function sendNotification(
  senderRole: RecipientRole,
  payload: NotificationPayload,
  preferredChannel?: NotificationChannel
): Promise<SendNotificationResult> {
  if (isDirectPathBlocked(senderRole, payload.recipientRole)) {
    const mediator = getMediator(senderRole, payload.recipientRole);
    const log: NotificationLog = {
      id: generateId(),
      templateId: payload.templateId,
      recipientId: payload.recipientId,
      recipientRole: payload.recipientRole,
      senderRole,
      channel: 'in_app',
      status: 'blocked',
      blockedReason: `Direct ${senderRole}→${payload.recipientRole} communication blocked. Use ${mediator || 'official'} channel.`,
      createdAt: new Date().toISOString(),
    };
    saveNotificationLog(log);

    return {
      success: false,
      logId: log.id,
      blocked: true,
      blockedReason: log.blockedReason,
    };
  }

  const route = findRoute(senderRole, payload.recipientRole);
  const channel = preferredChannel && route?.channels.includes(preferredChannel)
    ? preferredChannel
    : route?.channels[0] || 'in_app';

  const template = getTemplate(payload.templateId);
  if (!template) {
    return { success: false, blockedReason: 'Template not found' };
  }

  const rendered = renderTemplate(template, payload.variables, payload.language);

  const log: NotificationLog = {
    id: generateId(),
    templateId: payload.templateId,
    recipientId: payload.recipientId,
    recipientRole: payload.recipientRole,
    senderRole,
    channel,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    switch (channel) {
      case 'whatsapp':
        if (payload.recipientPhone) {
          const whatsappUrl = getWhatsAppUrl(payload.recipientPhone, rendered.body);
          log.status = 'sent';
          log.sentAt = new Date().toISOString();
          saveNotificationLog(log);
          return { success: true, logId: log.id, whatsappUrl };
        }
        log.status = 'failed';
        saveNotificationLog(log);
        return { success: false, logId: log.id, blockedReason: 'No phone number' };

      case 'email':
        log.status = 'pending';
        saveNotificationLog(log);
        return { success: true, logId: log.id };

      case 'sms':
        log.status = 'pending';
        saveNotificationLog(log);
        return { success: true, logId: log.id };

      case 'in_app':
      default:
        log.status = 'sent';
        log.sentAt = new Date().toISOString();
        saveNotificationLog(log);
        return { success: true, logId: log.id };
    }
  } catch (error) {
    log.status = 'failed';
    saveNotificationLog(log);
    return { success: false, logId: log.id, blockedReason: 'Send failed' };
  }
}

export async function routeStudentMessage(
  studentId: string,
  studentName: string,
  studentPhone: string,
  message: string,
  language: 'en' | 'hi' = 'hi'
): Promise<SendNotificationResult> {
  return sendNotification('student', {
    templateId: 'student_message_to_ss',
    recipientId: 'ss_team',
    recipientRole: 'ss',
    language,
    variables: {
      studentName,
      studentPhone,
      message,
    },
    priority: 'normal',
  });
}

export async function routeEmployerMessage(
  employerId: string,
  employerName: string,
  companyName: string,
  employerEmail: string,
  message: string,
  language: 'en' | 'hi' = 'en'
): Promise<SendNotificationResult> {
  return sendNotification('employer', {
    templateId: 'employer_message_to_cs',
    recipientId: 'cs_team',
    recipientRole: 'cs',
    recipientEmail: employerEmail,
    language,
    variables: {
      employerName,
      companyName,
      employerEmail,
      message,
    },
    priority: 'normal',
  });
}

export function getNotificationHistory(
  filters?: {
    recipientRole?: RecipientRole;
    senderRole?: RecipientRole;
    status?: NotificationLog['status'];
    channel?: NotificationChannel;
    limit?: number;
  }
): NotificationLog[] {
  let logs = getNotificationLogs();

  if (filters?.recipientRole) {
    logs = logs.filter(l => l.recipientRole === filters.recipientRole);
  }
  if (filters?.senderRole) {
    logs = logs.filter(l => l.senderRole === filters.senderRole);
  }
  if (filters?.status) {
    logs = logs.filter(l => l.status === filters.status);
  }
  if (filters?.channel) {
    logs = logs.filter(l => l.channel === filters.channel);
  }
  if (filters?.limit) {
    logs = logs.slice(0, filters.limit);
  }

  return logs;
}

export function getBlockedAttempts(): NotificationLog[] {
  return getNotificationLogs().filter(l => l.status === 'blocked');
}

export function clearNotificationHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

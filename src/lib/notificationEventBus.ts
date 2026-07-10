import type { HandoffPacket, NotificationLog, RecipientRole } from '@/types/notifications';

export type NotificationEventType =
  | 'packet:created'
  | 'packet:sent'
  | 'packet:received'
  | 'packet:actioned'
  | 'notification:sent'
  | 'notification:blocked'
  | 'notification:failed'
  | 'message:routed'
  | 'direct_contact:blocked';

export interface NotificationEvent {
  type: NotificationEventType;
  timestamp: string;
  payload: Record<string, unknown>;
  sourceRole?: RecipientRole;
  targetRole?: RecipientRole;
}

type EventHandler = (event: NotificationEvent) => void;

class NotificationEventBus {
  private handlers: Map<NotificationEventType, Set<EventHandler>> = new Map();
  private eventLog: NotificationEvent[] = [];
  private readonly MAX_LOG_SIZE = 200;

  subscribe(eventType: NotificationEventType, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  subscribeAll(handler: EventHandler): () => void {
    const unsubscribers: (() => void)[] = [];
    const eventTypes: NotificationEventType[] = [
      'packet:created',
      'packet:sent',
      'packet:received',
      'packet:actioned',
      'notification:sent',
      'notification:blocked',
      'notification:failed',
      'message:routed',
      'direct_contact:blocked',
    ];

    eventTypes.forEach(type => {
      unsubscribers.push(this.subscribe(type, handler));
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  emit(event: NotificationEvent): void {
    this.eventLog.unshift(event);
    if (this.eventLog.length > this.MAX_LOG_SIZE) {
      this.eventLog.pop();
    }

    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Event handler error for ${event.type}:`, error);
        }
      });
    }
  }

  emitPacketCreated(packet: HandoffPacket): void {
    this.emit({
      type: 'packet:created',
      timestamp: new Date().toISOString(),
      payload: {
        packetId: packet.id,
        packetType: packet.type,
        studentId: packet.studentId,
        studentName: packet.studentName,
        createdBy: packet.createdBy,
        createdByRole: packet.createdByRole,
      },
      sourceRole: packet.createdByRole,
    });
  }

  emitPacketSent(packet: HandoffPacket): void {
    this.emit({
      type: 'packet:sent',
      timestamp: new Date().toISOString(),
      payload: {
        packetId: packet.id,
        packetType: packet.type,
        studentName: packet.studentName,
        targetRoles: packet.targetRoles,
      },
      sourceRole: packet.createdByRole,
    });
  }

  emitPacketReceived(packet: HandoffPacket, receiverRole: RecipientRole): void {
    this.emit({
      type: 'packet:received',
      timestamp: new Date().toISOString(),
      payload: {
        packetId: packet.id,
        packetType: packet.type,
        receiverRole,
      },
      targetRole: receiverRole,
    });
  }

  emitNotificationSent(log: NotificationLog): void {
    this.emit({
      type: 'notification:sent',
      timestamp: new Date().toISOString(),
      payload: {
        logId: log.id,
        templateId: log.templateId,
        channel: log.channel,
        recipientRole: log.recipientRole,
      },
      sourceRole: log.senderRole,
      targetRole: log.recipientRole,
    });
  }

  emitNotificationBlocked(log: NotificationLog): void {
    this.emit({
      type: 'notification:blocked',
      timestamp: new Date().toISOString(),
      payload: {
        logId: log.id,
        senderRole: log.senderRole,
        recipientRole: log.recipientRole,
        reason: log.blockedReason,
      },
      sourceRole: log.senderRole,
      targetRole: log.recipientRole,
    });
  }

  emitDirectContactBlocked(sourceRole: RecipientRole, targetRole: RecipientRole, mediator?: RecipientRole): void {
    this.emit({
      type: 'direct_contact:blocked',
      timestamp: new Date().toISOString(),
      payload: {
        message: `Direct ${sourceRole}→${targetRole} blocked. Use ${mediator || 'SS/CS'} channel.`,
        mediator,
      },
      sourceRole,
      targetRole,
    });
  }

  getRecentEvents(limit: number = 50): NotificationEvent[] {
    return this.eventLog.slice(0, limit);
  }

  getEventsByType(type: NotificationEventType, limit: number = 20): NotificationEvent[] {
    return this.eventLog.filter(e => e.type === type).slice(0, limit);
  }

  clearEventLog(): void {
    this.eventLog = [];
  }
}

export const notificationEventBus = new NotificationEventBus();

export function useNotificationEvents(
  eventType: NotificationEventType | 'all',
  callback: EventHandler
): void {
  if (typeof window === 'undefined') return;

  const unsubscribe = eventType === 'all'
    ? notificationEventBus.subscribeAll(callback)
    : notificationEventBus.subscribe(eventType, callback);

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', unsubscribe);
  }
}

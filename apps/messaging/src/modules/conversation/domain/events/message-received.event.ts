import { BaseEvent } from '@common/interfaces/base-event.interface';
import { MESSAGING_EVENTS } from '@src/domain/constants/events/messaging.constant';

export interface MessageReceivedEventPayload {
  messageId: string;
  conversationId: string;
  clinicId: string;
  organizationId: string;
  contactPhone: string;
  body: string | null;
  patientId: string | null;
  leadId: string | null;
}

/**
 * Bir kontaktan gelen (inbound) mesaj kaydedildiğinde fırlatılır. Şu an parke;
 * sonraki turda AI sohbet desteği bu event'e abone olup yanıt üretecek (audit de
 * dinleyebilir).
 */
export class MessageReceivedEvent extends BaseEvent {
  static readonly NAME = MESSAGING_EVENTS.MESSAGE_RECEIVED;

  public readonly messageId: string;
  public readonly conversationId: string;
  public readonly clinicId: string;
  public readonly organizationId: string;
  public readonly contactPhone: string;
  public readonly body: string | null;
  public readonly patientId: string | null;
  public readonly leadId: string | null;

  constructor(payload: MessageReceivedEventPayload) {
    super();
    this.messageId = payload.messageId;
    this.conversationId = payload.conversationId;
    this.clinicId = payload.clinicId;
    this.organizationId = payload.organizationId;
    this.contactPhone = payload.contactPhone;
    this.body = payload.body;
    this.patientId = payload.patientId;
    this.leadId = payload.leadId;
  }
}

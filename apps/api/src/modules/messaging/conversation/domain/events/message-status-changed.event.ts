import { MessageStatus } from '@prisma/client';
import { BaseEvent } from '@common/interfaces/base-event.interface';
import { MESSAGING_EVENTS } from '@src/domain/constants/events';

export interface MessageStatusChangedEventPayload {
  messageId: string;
  conversationId: string;
  externalId: string | null;
  previousStatus: MessageStatus;
  status: MessageStatus;
}

/**
 * Giden bir mesajın teslim durumu değiştiğinde (SENT→DELIVERED→READ / FAILED)
 * fırlatılır. Şu an parke; ileride okundu-bilgisi / hata bildirimleri buna abone olur.
 */
export class MessageStatusChangedEvent extends BaseEvent {
  static readonly NAME = MESSAGING_EVENTS.MESSAGE_STATUS_CHANGED;

  public readonly messageId: string;
  public readonly conversationId: string;
  public readonly externalId: string | null;
  public readonly previousStatus: MessageStatus;
  public readonly status: MessageStatus;

  constructor(payload: MessageStatusChangedEventPayload) {
    super();
    this.messageId = payload.messageId;
    this.conversationId = payload.conversationId;
    this.externalId = payload.externalId;
    this.previousStatus = payload.previousStatus;
    this.status = payload.status;
  }
}

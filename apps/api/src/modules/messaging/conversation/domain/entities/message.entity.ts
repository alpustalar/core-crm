import {
  MessageDirection,
  MessageStatus,
  MessageType,
} from '@prisma/client';
import { Message as IMessage } from '@shared/generated-zod';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { MessageStatusChangedEvent } from '../events/message-status-changed.event';
import {
  CreateInboundMessageProps,
  CreateOutboundMessageProps,
} from '../types/create-message.props';

/** Giden mesaj teslim akışındaki ileri-yön sıralaması (idempotent webhook için). */
const DELIVERY_RANK: Record<MessageStatus, number> = {
  RECEIVED: 0,
  QUEUED: 0,
  SENT: 1,
  DELIVERED: 2,
  READ: 3,
  FAILED: 0,
};

/**
 * Yazışma içindeki tek mesaj (gelen/giden). Durum geçişleri idempotenttir: webhook
 * mükerrer/sırasız status iletebildiği için yalnızca ileri-yön geçişler uygulanır ve
 * gerçek değişimde MessageStatusChangedEvent fırlatılır.
 */
export class Message extends AggregateRoot implements IMessage {
  constructor(data: IMessage) {
    super();
    this._id = data.id;
    this._conversationId = data.conversationId;
    this._direction = data.direction;
    this._type = data.type;
    this._body = data.body;
    this._mediaUrl = data.mediaUrl;
    this._status = data.status;
    this._externalId = data.externalId;
    this._errorReason = data.errorReason;
    this._sentByUserId = data.sentByUserId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _conversationId: string;
  get conversationId(): string {
    return this._conversationId;
  }

  private _direction: MessageDirection;
  get direction(): MessageDirection {
    return this._direction;
  }

  private _type: MessageType;
  get type(): MessageType {
    return this._type;
  }

  private _body: string | null;
  get body(): string | null {
    return this._body;
  }

  private _mediaUrl: string | null;
  get mediaUrl(): string | null {
    return this._mediaUrl;
  }

  private _status: MessageStatus;
  get status(): MessageStatus {
    return this._status;
  }

  private _externalId: string | null;
  get externalId(): string | null {
    return this._externalId;
  }

  private _errorReason: string | null;
  get errorReason(): string | null {
    return this._errorReason;
  }

  private _sentByUserId: string | null;
  get sentByUserId(): string | null {
    return this._sentByUserId;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /** Gelen (inbound) mesaj — status RECEIVED. */
  public static createInbound(props: CreateInboundMessageProps): Message {
    const now = new Date();
    return new Message({
      id: props.id ?? crypto.randomUUID(),
      conversationId: props.conversationId,
      direction: MessageDirection.INBOUND,
      type: props.type ?? MessageType.TEXT,
      body: props.body ?? null,
      mediaUrl: props.mediaUrl ?? null,
      status: MessageStatus.RECEIVED,
      externalId: props.externalId ?? null,
      errorReason: null,
      sentByUserId: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Giden (outbound) mesaj — başlangıç status QUEUED (kanal portuna verilmeden önce). */
  public static createOutbound(props: CreateOutboundMessageProps): Message {
    const now = new Date();
    return new Message({
      id: props.id ?? crypto.randomUUID(),
      conversationId: props.conversationId,
      direction: MessageDirection.OUTBOUND,
      type: props.type ?? MessageType.TEXT,
      body: props.body ?? null,
      mediaUrl: props.mediaUrl ?? null,
      status: MessageStatus.QUEUED,
      externalId: null,
      errorReason: null,
      sentByUserId: props.sentByUserId ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Kanal portu mesajı kabul etti — externalId atanır, QUEUED→SENT. */
  public markSent(externalId: string): void {
    this._externalId = externalId;
    this.transitionTo(MessageStatus.SENT);
  }

  public markDelivered(): void {
    this.transitionTo(MessageStatus.DELIVERED);
  }

  public markRead(): void {
    this.transitionTo(MessageStatus.READ);
  }

  public markFailed(reason?: string): void {
    // Teslim edilmiş/okunmuş mesaj geriye FAILED olamaz.
    if (DELIVERY_RANK[this._status] >= DELIVERY_RANK[MessageStatus.DELIVERED]) {
      return;
    }
    if (this._status === MessageStatus.FAILED) return;
    const previousStatus = this._status;
    this._status = MessageStatus.FAILED;
    this._errorReason = reason ?? null;
    this.addDomainEvent(
      new MessageStatusChangedEvent({
        messageId: this._id,
        conversationId: this._conversationId,
        externalId: this._externalId,
        previousStatus,
        status: MessageStatus.FAILED,
      })
    );
  }

  public toPersistence(): IMessage {
    return {
      id: this._id,
      conversationId: this._conversationId,
      direction: this._direction,
      type: this._type,
      body: this._body,
      mediaUrl: this._mediaUrl,
      status: this._status,
      externalId: this._externalId,
      errorReason: this._errorReason,
      sentByUserId: this._sentByUserId,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }

  /** Yalnızca ileri-yön teslim geçişlerini uygular; gerçek değişimde event fırlatır. */
  private transitionTo(next: MessageStatus): void {
    if (DELIVERY_RANK[next] <= DELIVERY_RANK[this._status]) return;
    const previousStatus = this._status;
    this._status = next;
    this.addDomainEvent(
      new MessageStatusChangedEvent({
        messageId: this._id,
        conversationId: this._conversationId,
        externalId: this._externalId,
        previousStatus,
        status: next,
      })
    );
  }
}

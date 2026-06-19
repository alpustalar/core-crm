import { ConversationStatus, MessageChannel } from '@prisma/client';
import { Conversation as IConversation } from '@shared/generated-zod';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { MessageReceivedEvent } from '../events/message-received.event';
import {
  LinkContactProps,
  StartConversationProps,
} from '../types/create-conversation.props';

/**
 * Bir kontak ile yazışma başlığı (thread) — messaging aggregate root. Mesajlar yüksek
 * hacimli olduğu için aggregate içinde tutulmaz; Conversation yalnızca thread meta'sını
 * (durum, atama, son mesaj, kontak eşlemesi) yönetir. Inbound mesaj kaydı bu entity'den
 * MessageReceivedEvent fırlatır (AI/audit sonra abone olur).
 */
export class Conversation extends AggregateRoot implements IConversation {
  constructor(data: IConversation) {
    super();
    this._id = data.id;
    this._clinicId = data.clinicId;
    this._organizationId = data.organizationId;
    this._channel = data.channel;
    this._contactPhone = data.contactPhone;
    this._contactName = data.contactName;
    this._patientId = data.patientId;
    this._leadId = data.leadId;
    this._status = data.status;
    this._assignedUserId = data.assignedUserId;
    this._lastMessageAt = data.lastMessageAt;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
  }

  private _channel: MessageChannel;
  get channel(): MessageChannel {
    return this._channel;
  }

  private _contactPhone: string;
  get contactPhone(): string {
    return this._contactPhone;
  }

  private _contactName: string | null;
  get contactName(): string | null {
    return this._contactName;
  }

  private _patientId: string | null;
  get patientId(): string | null {
    return this._patientId;
  }

  private _leadId: string | null;
  get leadId(): string | null {
    return this._leadId;
  }

  private _status: ConversationStatus;
  get status(): ConversationStatus {
    return this._status;
  }

  private _assignedUserId: string | null;
  get assignedUserId(): string | null {
    return this._assignedUserId;
  }

  private _lastMessageAt: Date | null;
  get lastMessageAt(): Date | null {
    return this._lastMessageAt;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /** Yeni yazışma başlığı (status OPEN). */
  public static start(props: StartConversationProps): Conversation {
    const now = new Date();
    return new Conversation({
      id: props.id ?? crypto.randomUUID(),
      clinicId: props.clinicId,
      organizationId: props.organizationId,
      channel: props.channel ?? MessageChannel.WHATSAPP,
      contactPhone: props.contactPhone,
      contactName: props.contactName ?? null,
      patientId: props.patientId ?? null,
      leadId: props.leadId ?? null,
      status: ConversationStatus.OPEN,
      assignedUserId: null,
      lastMessageAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Gelen bir mesajı thread'e işler: son mesaj zamanını günceller, kapalıysa yeniden
   * açar ve MessageReceivedEvent fırlatır (bağlam Conversation'da olduğu için event
   * burada üretilir).
   */
  public recordInboundMessage(input: {
    messageId: string;
    body: string | null;
    occurredAt?: Date;
  }): void {
    this._lastMessageAt = input.occurredAt ?? new Date();
    if (this._status === ConversationStatus.CLOSED) {
      this._status = ConversationStatus.OPEN;
    }
    this.addDomainEvent(
      new MessageReceivedEvent({
        messageId: input.messageId,
        conversationId: this._id,
        clinicId: this._clinicId,
        organizationId: this._organizationId,
        contactPhone: this._contactPhone,
        body: input.body,
        patientId: this._patientId,
        leadId: this._leadId,
      })
    );
  }

  /** Giden mesaj sonrası son-mesaj zamanını günceller (event yok). */
  public touch(at?: Date): void {
    this._lastMessageAt = at ?? new Date();
  }

  public assign(userId: string): void {
    this._assignedUserId = userId;
    if (this._status === ConversationStatus.OPEN) {
      this._status = ConversationStatus.PENDING;
    }
  }

  public close(): void {
    this._status = ConversationStatus.CLOSED;
  }

  public reopen(): void {
    this._status = ConversationStatus.OPEN;
  }

  /** Kontağı hasta/lead ile eşler (ilkel id; Clinic/Patient ilişkilerine sızılmaz). */
  public linkContact(props: LinkContactProps): void {
    if (props.patientId !== undefined) this._patientId = props.patientId;
    if (props.leadId !== undefined) this._leadId = props.leadId;
    if (props.contactName !== undefined) this._contactName = props.contactName;
  }

  public toPersistence(): IConversation {
    return {
      id: this._id,
      clinicId: this._clinicId,
      organizationId: this._organizationId,
      channel: this._channel,
      contactPhone: this._contactPhone,
      contactName: this._contactName,
      patientId: this._patientId,
      leadId: this._leadId,
      status: this._status,
      assignedUserId: this._assignedUserId,
      lastMessageAt: this._lastMessageAt,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}

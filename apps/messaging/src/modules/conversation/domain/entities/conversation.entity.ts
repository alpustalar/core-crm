import { ConversationStatus, MessageChannel } from '@shared';
import { Conversation as IConversation } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { DateTimeManager } from '@common/utils';
import { MessageReceivedEvent } from '../events/message-received.event';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import {
  LinkContactProps,
  StartConversationProps,
} from '@modules/conversation/domain/contracts/conversation.contracts';

/** WhatsApp müşteri hizmetleri penceresi: son gelen mesajdan itibaren 24 saat. */
const SERVICE_WINDOW_HOURS = 24;

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
    this._lastInboundAt = data.lastInboundAt;
    this._unreadCount = data.unreadCount;
    this._agentReadAt = data.agentReadAt;
    this._windowExpiresAt = data.windowExpiresAt;
    this._marketingOptOut = data.marketingOptOut;
    this._optOutAt = data.optOutAt;
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

  private _lastInboundAt: Date | null;
  get lastInboundAt(): Date | null {
    return this._lastInboundAt;
  }

  private _unreadCount: number;
  get unreadCount(): number {
    return this._unreadCount;
  }

  private _agentReadAt: Date | null;
  get agentReadAt(): Date | null {
    return this._agentReadAt;
  }

  private _windowExpiresAt: Date | null;
  get windowExpiresAt(): Date | null {
    return this._windowExpiresAt;
  }

  private _marketingOptOut: boolean;
  get marketingOptOut(): boolean {
    return this._marketingOptOut;
  }

  private _optOutAt: Date | null;
  get optOutAt(): Date | null {
    return this._optOutAt;
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
    const now = DateTimeManager.create();
    return new Conversation({
      id: UUID.createOrGenerate(props.id).value,
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
      lastInboundAt: null,
      unreadCount: 0,
      agentReadAt: null,
      windowExpiresAt: null,
      marketingOptOut: false,
      optOutAt: null,
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
    const at = input.occurredAt ?? DateTimeManager.create();
    this._lastMessageAt = at;
    this._lastInboundAt = at;
    this._unreadCount += 1;
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
    this._lastMessageAt = at ?? DateTimeManager.create();
  }

  /** Ajan yazışmayı okudu — okunmamış sayacı sıfırlanır, okuma anı kaydedilir. */
  public markAgentRead(at: Date = DateTimeManager.create()): void {
    this._unreadCount = 0;
    this._agentReadAt = at;
  }

  /** Aktif WhatsApp konuşma penceresi bitiş anını günceller (webhook pricing'ten). */
  public setWindowExpiry(at: Date | null): void {
    this._windowExpiresAt = at;
  }

  /** Kontak pazarlama mesajlarından çıkma (opt-out) talep etti. */
  public optOutMarketing(at: Date = DateTimeManager.create()): void {
    this._marketingOptOut = true;
    this._optOutAt = at;
  }

  /** Kontak pazarlama mesajlarına yeniden onay verdi (opt-in). */
  public resumeMarketing(): void {
    this._marketingOptOut = false;
    this._optOutAt = null;
  }

  public assign(userId: string): void {
    this._assignedUserId = userId;
    if (this._status === ConversationStatus.OPEN) {
      this._status = ConversationStatus.PENDING;
    }
  }

  /**
   * AI asistanı yazışmayı klinik ekibine devreder (belirli bir kullanıcı atanmaz).
   * Status OPEN → PENDING; böylece sonraki gelen mesajlarda AI susar (guard) ve
   * yazışma insan kuyruğunda kalır.
   */
  public requestHumanHandoff(): void {
    if (this._status === ConversationStatus.OPEN) {
      this._status = ConversationStatus.PENDING;
    }
  }

  /** AI otomatik yanıt verebilir mi? Yalnız OPEN yazışmalar (atanmamış/devredilmemiş). */
  public isEligibleForAiReply(): boolean {
    return (
      this._status === ConversationStatus.OPEN &&
      this._assignedUserId === null &&
      !this._marketingOptOut
    );
  }

  public close(): void {
    this._status = ConversationStatus.CLOSED;
  }

  public reopen(): void {
    this._status = ConversationStatus.OPEN;
  }

  /**
   * WhatsApp 24s müşteri hizmetleri penceresi açık mı? Pencere açıkken serbest (session)
   * mesaj gönderilebilir; kapalıyken yalnızca onaylı şablon (HSM) gönderilebilir.
   */
  public isWithinServiceWindow(now: Date = DateTimeManager.create()): boolean {
    if (!this._lastInboundAt) return false;
    return (
      DateTimeManager.diffInHours(now, this._lastInboundAt) <
      SERVICE_WINDOW_HOURS
    );
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
      lastInboundAt: this._lastInboundAt,
      unreadCount: this._unreadCount,
      agentReadAt: this._agentReadAt,
      windowExpiresAt: this._windowExpiresAt,
      marketingOptOut: this._marketingOptOut,
      optOutAt: this._optOutAt,
      createdAt: this._createdAt,
      updatedAt: DateTimeManager.create(),
    };
  }
}

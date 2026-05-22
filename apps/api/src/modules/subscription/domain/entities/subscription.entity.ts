import { Subscription as PrismaSubscription, SubStatus } from '@prisma/client';
import { DateTimeManager } from '@common/utils';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { SubscriptionItem } from './subscription-item.entity';
import {
  SubscriptionActivatedEvent,
  SubscriptionActivatedEventPayload,
  SubscriptionPaymentFailedEvent,
  SubscriptionPaymentFailedEventPayload,
} from '@modules/subscription/domain/events';

export class Subscription extends AggregateRoot implements PrismaSubscription {
  constructor(data: PrismaSubscription) {
    super();
    this._id = data.id;
    this._organizationId = data.organizationId;
    this._externalId = data.externalId;
    this._status = data.status;
    this._trialEndsAt = data.trialEndsAt;
    this._currentPeriodStart = data.currentPeriodStart;
    this._currentPeriodEnd = data.currentPeriodEnd;
    this._cancelAtPeriodEnd = data.cancelAtPeriodEnd;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
  }

  private _externalId: string | null;
  get externalId(): string | null {
    return this._externalId;
  }

  private _status: SubStatus;
  get status(): SubStatus {
    return this._status;
  }

  private _trialEndsAt: Date | null;
  get trialEndsAt(): Date | null {
    return this._trialEndsAt;
  }

  private _currentPeriodStart: Date | null;
  get currentPeriodStart(): Date | null {
    return this._currentPeriodStart;
  }

  private _currentPeriodEnd: Date | null;
  get currentPeriodEnd(): Date | null {
    return this._currentPeriodEnd;
  }

  private _cancelAtPeriodEnd: boolean;
  get cancelAtPeriodEnd(): boolean {
    return this._cancelAtPeriodEnd;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  private _items: SubscriptionItem[] | null;
  get items(): SubscriptionItem[] | null {
    return this._items;
  }

  // Durum sorguları
  get isActive(): boolean {
    return this._status === SubStatus.ACTIVE;
  }
  get isCanceled(): boolean {
    return this._status === SubStatus.CANCELED;
  }
  get isPastDue(): boolean {
    return this._status === SubStatus.PAST_DUE;
  }
  get isExpired(): boolean {
    return this._status === SubStatus.EXPIRED;
  }

  get isOnTrial(): boolean {
    return !!this._trialEndsAt && this._trialEndsAt > new Date();
  }

  get isCancelScheduled(): boolean {
    return this._cancelAtPeriodEnd && this.isActive;
  }

  get isInCurrentPeriod(): boolean {
    if (!this._currentPeriodStart || !this._currentPeriodEnd) return false;
    return DateTimeManager.isBetween({
      target: new Date(),
      start: this._currentPeriodStart,
      end: this._currentPeriodEnd,
      inclusivity: '[)',
    });
  }

  // Durum geçişleri
  public confirmPayment(
    iyzicoPaymentId: string,
    eventPayload: Omit<
      SubscriptionActivatedEventPayload,
      'subscriptionId' | 'organizationId' | 'iyzicoPaymentId'
    >
  ): void {
    this._externalId = iyzicoPaymentId;
    this._status = SubStatus.ACTIVE;
    this._cancelAtPeriodEnd = false;
    this.addDomainEvent(
      new SubscriptionActivatedEvent({
        ...eventPayload,
        subscriptionId: this._id,
        organizationId: this._organizationId,
        iyzicoPaymentId,
      })
    );
  }

  public failPayment(
    eventPayload: Omit<
      SubscriptionPaymentFailedEventPayload,
      'subscriptionId' | 'organizationId'
    >
  ): void {
    this._status = SubStatus.PAST_DUE;
    this.addDomainEvent(
      new SubscriptionPaymentFailedEvent({
        ...eventPayload,
        subscriptionId: this._id,
        organizationId: this._organizationId,
      })
    );
  }

  public scheduleCancellation(): void {
    if (!this.isActive) {
      throw new Error('Yalnızca aktif abonelikler iptal planlanabilir.');
    }
    this._cancelAtPeriodEnd = true;
  }

  public undoCancellation(): void {
    if (!this._cancelAtPeriodEnd) {
      throw new Error(
        'İptal planlanmamış abonelik üzerinde geri alma yapılamaz.'
      );
    }
    this._cancelAtPeriodEnd = false;
  }

  public cancel(): void {
    if (this.isCanceled) {
      throw new Error('Abonelik zaten iptal edilmiş.');
    }
    this._status = SubStatus.CANCELED;
    this._cancelAtPeriodEnd = false;
  }

  public activate(): void {
    if (this.isActive) {
      throw new Error('Abonelik zaten aktif.');
    }
    this._status = SubStatus.ACTIVE;
    this._cancelAtPeriodEnd = false;
  }

  toPersistence(): PrismaSubscription {
    return {
      id: this._id,
      organizationId: this._organizationId,
      externalId: this._externalId,
      status: this._status,
      trialEndsAt: this._trialEndsAt,
      currentPeriodStart: this._currentPeriodStart,
      currentPeriodEnd: this._currentPeriodEnd,
      cancelAtPeriodEnd: this._cancelAtPeriodEnd,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

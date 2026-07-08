import { DateTimeManager } from '@common/utils';
import { Subscription as ISubscription, SubStatusSchema } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import {
  SubscriptionActivatedEvent,
  SubscriptionActivatedEventPayload,
  SubscriptionPaymentFailedEvent,
  SubscriptionPaymentFailedEventPayload,
  SubscriptionRenewedEvent,
  SubscriptionRenewedEventPayload,
} from '@modules/platform/subscription/domain/events';
import { SubStatusType as SubStatus } from '@input-type-schemas/SubStatusSchema';
import { BillingTargetType as BillingTarget } from '@input-type-schemas/BillingTargetSchema';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Guard } from '@common/domain/guards';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import { shouldValidate } from '@common/domain/utils/should-validate';
import { CreateSubscriptionProps } from '@modules/platform/subscription/domain/subscription.contracts';
import { DateRange } from '@src/domain/value-objects/date-range.vo';

/** `Subscription.renew` girişi — yeni dönem + son ödeme referansı + audit event gövdesi. */
export interface RenewSubscriptionInput {
  periodStart: Date;
  periodEnd: Date;
  iyzicoPaymentId: string;
  event: Omit<
    SubscriptionRenewedEventPayload,
    | 'subscriptionId'
    | 'organizationId'
    | 'iyzicoPaymentId'
    | 'periodStart'
    | 'periodEnd'
  >;
}

export class Subscription extends AggregateRoot {
  constructor(data: ISubscription) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._billingTarget = data.billingTarget;
    this._organizationId = UUID.fromTrusted(data.organizationId);
    this._clinicId = UUID.create(data.clinicId).instance ?? null;
    this._externalId = data.externalId;
    this._status = data.status;
    this._trialEndsAt = data.trialEndsAt;

    this._currentPeriodDateRange =
      DateRange.create(data.currentPeriodStart, data.currentPeriodEnd)
        .instance ?? null;

    this._cancelAtPeriodEnd = data.cancelAtPeriodEnd;

    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _billingTarget: BillingTarget;
  get billingTarget(): BillingTarget {
    return this._billingTarget;
  }

  private _organizationId: UUID;
  get organizationId(): UUID {
    return this._organizationId;
  }

  private _clinicId: UUID | null;
  get clinicId(): UUID | null {
    return this._clinicId;
  }

  private _externalId: string | null;
  get externalId(): string | null {
    return this._externalId;
  }

  private _status: SubStatus;
  get status(): SubStatus {
    return this._status;
  }

  private _currentPeriodDateRange: DateRange | null;
  get currentPeriodDateRange(): DateRange | null {
    return this._currentPeriodDateRange;
  }

  private _trialEndsAt: Date | null;
  get trialEndsAt(): Date | null {
    return this._trialEndsAt;
  }

  private _currentPeriodStart: Date | null;
  get currentPeriodStart(): Date | null {
    return this.currentPeriodDateRange?.startDate ?? null;
  }

  private _currentPeriodEnd: Date | null;
  get currentPeriodEnd(): Date | null {
    return this.currentPeriodDateRange?.endDate ?? null;
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

  private get _businessRulesValidator() {
    return {
      scheduleCancellation: () => {
        const isInvalid = !this._isActive.value;
        return {
          isValid: !isInvalid,
          orThrow: () => {
            if (isInvalid)
              throw new Error(
                'Yalnızca aktif abonelikler iptal planlanabilir.'
              );
          },
        };
      },
      undoCancellation: () => {
        const isInvalid = !this._cancelAtPeriodEnd;
        return {
          isValid: !isInvalid,
          orThrow: () => {
            if (isInvalid)
              throw new Error(
                'İptal planlanmamış abonelik üzerinde geri alma yapılamaz.'
              );
          },
        };
      },
      cancel: () => {
        const isInvalid = this._isCanceled.value;

        return {
          isValid: !isInvalid,
          orThrow: () => {
            if (isInvalid) {
              throw new Error('Abonelik zaten iptal edilmiş.');
            }
          },
        };
      },
    };
  }

  // Durum sorguları
  private get _isActive() {
    const is = this._status === SubStatusSchema.enum.ACTIVE;
    return Guard.monitor(
      is,
      is,
      () => new Error('Üyelik "aktif" durumda değil')
    );
  }

  private get _isCanceled() {
    const is = this._status === SubStatusSchema.enum.CANCELED;
    return Guard.monitor(
      is,
      is,
      () => new Error('Üyelik "iptal" durumda değil')
    );
  }

  private get _isPastDue() {
    const is = this._status === SubStatusSchema.enum.PAST_DUE;
    return Guard.monitor(
      is,
      is,
      () => new Error('Üyelik "gecikmiş" durumda değil')
    );
  }

  private get _isExpired() {
    const is = this._status === SubStatusSchema.enum.EXPIRED;
    return Guard.monitor(
      is,
      is,
      () => new Error('Üyelik "süresi bitmiş" durumda değil')
    );
  }

  private get _isOnTrial() {
    const isTrialActive = !!this._trialEndsAt && this._trialEndsAt > new Date();
    return Guard.monitor(
      isTrialActive,
      isTrialActive,
      () => new Error('Deneme süresi bitmiş')
    );
  }

  private get _isCancelScheduled() {
    const isCancel = this._cancelAtPeriodEnd && this._isActive.value;
    return Guard.monitor(
      isCancel,
      isCancel,
      () => new Error('Abonelik iptal edilmek üzere zamanlanmamış')
    );
  }

  private get _isInCurrentPeriod() {
    const hasValidPeriod =
      !!this._currentPeriodStart && !!this._currentPeriodEnd;

    const isInside =
      hasValidPeriod &&
      DateTimeManager.isBetween({
        target: new Date(),
        start: this._currentPeriodStart!,
        end: this._currentPeriodEnd!,
        inclusivity: '[)', // Başlangıç dahil, bitiş hariç nizamı
      });

    return Guard.monitor(
      isInside,
      isInside,
      () =>
        new Error(
          'Şu anki tarih, aboneliğin aktif fatura dönemi içerisinde değil.'
        )
    );
  }

  public static create(props: CreateSubscriptionProps): Subscription {
    const subId = props.id ? UUID.create(props.id).orThrow() : UUID.generate();
    const orgId = UUID.create(props.organizationId).orThrow();

    // Faturalandırma hedefi CLINIC ise clinicId zorunlu; ORGANIZATION ise yok sayılır (null).
    const isClinicBilled = props.billingTarget === 'CLINIC';
    if (isClinicBilled && !props.clinicId) {
      throw new Error('CLINIC faturalandırma hedefinde clinicId zorunludur.');
    }
    const clinicId =
      isClinicBilled && props.clinicId
        ? UUID.create(props.clinicId).orThrow()
        : null;

    const now = DateTimeManager.create();

    return new Subscription({
      id: subId.value,
      billingTarget: props.billingTarget,
      organizationId: orgId.value,
      clinicId: clinicId?.value ?? null,
      externalId: props.externalId ?? null,
      status: SubStatusSchema.enum.ACTIVE,
      trialEndsAt: props.trialEndsAt ?? null,
      currentPeriodStart: props.currentPeriodStart ?? null,
      currentPeriodEnd: props.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Ödeme sağlayıcısının abonelik/işlem referansını bağlar (subscribe akışında callback için). */
  public linkExternalId(externalId: string): void {
    this._externalId = externalId;
  }

  /** Yenileme: yeni fatura dönemi başlatır, durumu ACTIVE'e çeker (renewal processor). */
  public startNewPeriod(start: Date, end: Date): void {
    this._currentPeriodDateRange = DateRange.create(start, end).orThrow();
    this._status = SubStatusSchema.enum.ACTIVE;
  }

  /** PAST_DUE grace süresi sonrası abonelik süresi biter (expire processor). */
  public expire(): void {
    this._status = SubStatusSchema.enum.EXPIRED;
  }

  /**
   * Kayıtlı kartla başarılı otomatik tahsilat sonrası yeni fatura dönemi açılır (renewal processor).
   * Durum ACTIVE'e çekilir, externalId son ödeme referansına güncellenir ve yenileme event'i raise edilir.
   */
  public renew(input: RenewSubscriptionInput): void {
    this._currentPeriodDateRange = DateRange.create(
      input.periodStart,
      input.periodEnd
    ).orThrow();
    this._status = SubStatusSchema.enum.ACTIVE;
    this._cancelAtPeriodEnd = false;
    this._externalId = input.iyzicoPaymentId;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new SubscriptionRenewedEvent({
        ...input.event,
        subscriptionId: this._id.value,
        organizationId: this._organizationId.value,
        iyzicoPaymentId: input.iyzicoPaymentId,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
      })
    );
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
    this._status = SubStatusSchema.enum.ACTIVE;
    this._cancelAtPeriodEnd = false;
    this.addDomainEvent(
      new SubscriptionActivatedEvent({
        ...eventPayload,
        subscriptionId: this._id.value,
        organizationId: this._organizationId.value,
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
    this._status = SubStatusSchema.enum.PAST_DUE;
    this.addDomainEvent(
      new SubscriptionPaymentFailedEvent({
        ...eventPayload,
        subscriptionId: this._id.value,
        organizationId: this._organizationId.value,
      })
    );
  }

  public scheduleCancellation(options = DefaultValidateOptions): void {
    if (shouldValidate(options))
      this._businessRulesValidator.scheduleCancellation().orThrow();
    this._cancelAtPeriodEnd = true;
  }

  public undoCancellation(options = DefaultValidateOptions): void {
    if (shouldValidate(options))
      this._businessRulesValidator.undoCancellation().orThrow();
    this._cancelAtPeriodEnd = false;
  }

  public cancel(options = DefaultValidateOptions): void {
    if (shouldValidate(options))
      this._businessRulesValidator.cancel().orThrow();

    this._status = SubStatusSchema.enum.CANCELED;
    this._cancelAtPeriodEnd = false;
  }

  public activate(): void {
    if (this._isActive.value) {
      throw new Error('Abonelik zaten aktif.');
    }
    this._status = SubStatusSchema.enum.ACTIVE;
    this._cancelAtPeriodEnd = false;
  }

  toPersistence(): ISubscription {
    return {
      id: this._id.value,
      billingTarget: this._billingTarget,
      organizationId: this._organizationId.value,
      clinicId: this._clinicId?.value ?? null,
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

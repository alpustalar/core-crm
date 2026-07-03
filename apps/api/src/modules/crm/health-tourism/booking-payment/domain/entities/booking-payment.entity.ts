import {
  BookingPayment as IBookingPayment,
  BookingPaymentStatusSchema,
} from '@shared/generated-zod';
import { Prisma } from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import {
  BookingIntent,
  BookingPaymentLinks,
  BookingPaymentProviderValue,
  BookingPaymentStatusValue,
  BookingPaymentTypeValue,
  CreateBookingPaymentProps,
} from '../booking-payment.contracts';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { Url } from '@src/domain/value-objects/url.vo';
import { Money } from '@src/domain/value-objects/money.vo';
import { isNotUndefined } from '@common/utils/is-not-undefined';
import { Currency } from '@src/domain/value-objects/currency.vo';

type Decimal = IBookingPayment['saleAmount'];

/**
 * Sağlık turizmi ödeme-önce (payment-first) tahsilat saga kaydı. Hasta ödeme yapmadan
 * HotelBeds rezervasyonu açılmaz. Durum makinesi:
 * PENDING → (ödeme) PAID → (HotelBeds book) BOOKED | (hata) FAILED ; PENDING → EXPIRED ;
 * herhangi → REFUNDED. Çift-çekim (iki link de ödenirse) ikinci ödeme iade edilir.
 */
export class BookingPayment extends AggregateRoot {
  constructor(data: IBookingPayment) {
    const currency = Currency.fromTrusted(data.saleCurrency);
    super();
    this._id = UUID.fromTrusted(data.id);
    this._bookingType = data.bookingType;
    this._status = data.status;
    this._saleCurrency = currency;
    this._saleAmount = Money.fromTrusted(data.saleAmount, currency.value);
    this._tryAmount = Money.fromTrusted(data.tryAmount, currency.value);
    this._netAmount = Money.fromTrusted(data.netAmount, currency.value);
    this._fxRate = data.fxRate;
    this._intent = data.intent;
    this._iyzicoConversationId = data.iyzicoConversationId;
    this._iyzicoToken = data.iyzicoToken;
    this._iyzicoUrl = Url.create(data.iyzicoUrl).instance ?? null;
    this._stripeSessionId = data.stripeSessionId;
    this._stripeUrl = Url.create(data.stripeUrl).instance ?? null;
    this._paidProvider = data.paidProvider;
    this._paidProviderRef = data.paidProviderRef;
    this._paidAt = data.paidAt;
    this._bookingReference = data.bookingReference;
    this._bookingId = data.bookingId;
    this._failureReason = data.failureReason;
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._organizationId = UUID.fromTrusted(data.organizationId);
    this._patientId = data.patientId ? UUID.fromTrusted(data.patientId) : null;
    this._leadId = data.leadId ? UUID.fromTrusted(data.leadId) : null;
    this._conversationId = data.conversationId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _bookingType: BookingPaymentTypeValue;
  get bookingType(): BookingPaymentTypeValue {
    return this._bookingType;
  }

  private _status: BookingPaymentStatusValue;
  get status(): BookingPaymentStatusValue {
    return this._status;
  }

  private _saleCurrency: Currency;
  get saleCurrency(): Currency {
    return this._saleCurrency;
  }

  private _saleAmount: Money;
  get saleAmount(): Money {
    return this._saleAmount;
  }

  private _tryAmount: Money;
  get tryAmount(): Money {
    return this._tryAmount;
  }

  private _netAmount: Money;
  get netAmount(): Money {
    return this._netAmount;
  }

  private _fxRate: Decimal | null;
  get fxRate(): Decimal | null {
    return this._fxRate;
  }

  private _intent: IBookingPayment['intent'];
  get intent(): IBookingPayment['intent'] {
    return this._intent;
  }

  /** Tipli rezervasyon niyeti (replay için). */
  get bookingIntent(): BookingIntent {
    return this._intent as unknown as BookingIntent;
  }

  private _iyzicoConversationId: string | null;
  get iyzicoConversationId(): string | null {
    return this._iyzicoConversationId;
  }

  private _iyzicoToken: string | null;
  get iyzicoToken(): string | null {
    return this._iyzicoToken;
  }

  private _iyzicoUrl: Url | null;
  get iyzicoUrl(): Url | null {
    return this._iyzicoUrl;
  }

  private _stripeSessionId: string | null;
  get stripeSessionId(): string | null {
    return this._stripeSessionId;
  }

  private _stripeUrl: Url | null;
  get stripeUrl(): Url | null {
    return this._stripeUrl;
  }

  private _paidProvider: BookingPaymentProviderValue | null;
  get paidProvider(): BookingPaymentProviderValue | null {
    return this._paidProvider;
  }

  private _paidProviderRef: string | null;
  get paidProviderRef(): string | null {
    return this._paidProviderRef;
  }

  private _paidAt: Date | null;
  get paidAt(): Date | null {
    return this._paidAt;
  }

  private _bookingReference: string | null;
  get bookingReference(): string | null {
    return this._bookingReference;
  }

  private _bookingId: string | null;
  get bookingId(): string | null {
    return this._bookingId;
  }

  private _failureReason: string | null;
  get failureReason(): string | null {
    return this._failureReason;
  }

  private _clinicId: UUID;
  get clinicId(): UUID {
    return this._clinicId;
  }

  private _organizationId: UUID;
  get organizationId(): UUID {
    return this._organizationId;
  }

  private _patientId: UUID | null;
  get patientId(): UUID | null {
    return this._patientId;
  }

  private _leadId: UUID | null;
  get leadId(): UUID | null {
    return this._leadId;
  }

  private _conversationId: string | null;
  get conversationId(): string | null {
    return this._conversationId;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  // ------------------------------------------------------------------ factory

  public static create(props: CreateBookingPaymentProps): BookingPayment {
    const now = new Date();
    return new BookingPayment({
      id: props.id ?? crypto.randomUUID(),
      bookingType: props.bookingType,
      status: BookingPaymentStatusSchema.enum.PENDING,
      saleCurrency: props.saleCurrency,
      saleAmount: new Prisma.Decimal(props.saleAmount),
      tryAmount: new Prisma.Decimal(props.tryAmount),
      netAmount: new Prisma.Decimal(props.netAmount),
      fxRate: props.fxRate === null ? null : new Prisma.Decimal(props.fxRate),
      intent: props.intent as unknown as IBookingPayment['intent'],
      iyzicoConversationId: null,
      iyzicoToken: null,
      iyzicoUrl: null,
      stripeSessionId: null,
      stripeUrl: null,
      paidProvider: null,
      paidProviderRef: null,
      paidAt: null,
      bookingReference: null,
      bookingId: null,
      failureReason: null,
      clinicId: UUID.create(props.clinicId).orThrow().value,
      organizationId: UUID.create(props.organizationId).orThrow().value,
      patientId: props.patientId
        ? UUID.create(props.patientId).orThrow().value
        : null,
      leadId: props.leadId ? UUID.create(props.leadId).orThrow().value : null,
      conversationId: props.conversationId,
      createdAt: now,
      updatedAt: now,
    });
  }

  // ------------------------------------------------------------ state machine

  /** initiate sırasında üretilen sağlayıcı link bilgilerini saklar. */
  public attachLinks(links: BookingPaymentLinks): void {
    if (isNotUndefined(links.iyzicoConversationId)) {
      this._iyzicoConversationId = links.iyzicoConversationId;
    }
    if (isNotUndefined(links.iyzicoToken))
      this._iyzicoToken = links.iyzicoToken;

    if (isNotUndefined(links.iyzicoUrl))
      this._iyzicoUrl = links.iyzicoUrl
        ? Url.create(links.iyzicoUrl).orThrow()
        : null;

    if (isNotUndefined(links.stripeSessionId)) {
      this._stripeSessionId = links.stripeSessionId;
    }
    if (isNotUndefined(links.stripeUrl))
      this._stripeUrl = links.stripeUrl
        ? Url.create(links.stripeUrl).orThrow()
        : null;

    this._updatedAt = DateTimeManager.create();
  }

  public isPending(): boolean {
    return this._status === BookingPaymentStatusSchema.enum.PENDING;
  }

  public isPaid(): boolean {
    return this._status === BookingPaymentStatusSchema.enum.PAID;
  }

  public isSettled(): boolean {
    return (
      this._status === BookingPaymentStatusSchema.enum.PAID ||
      this._status === BookingPaymentStatusSchema.enum.BOOKED
    );
  }

  /** PENDING → PAID. providerRef iade için saklanır. */
  public markPaid(
    provider: BookingPaymentProviderValue,
    providerRef: string
  ): void {
    if (this._status !== BookingPaymentStatusSchema.enum.PENDING) {
      throw new Error(
        `Ödeme yalnız PENDING durumunda işaretlenebilir (mevcut: ${this._status}).`
      );
    }

    const now = DateTimeManager.create();
    this._status = BookingPaymentStatusSchema.enum.PAID;
    this._paidProvider = provider;
    this._paidProviderRef = providerRef;
    this._paidAt = now;
    this._updatedAt = now;
  }

  /** PAID → BOOKED. HotelBeds rezervasyonu tamamlandı. */
  public markBooked(reference: string, bookingId?: string | null): void {
    if (this._status !== BookingPaymentStatusSchema.enum.PAID) {
      throw new Error(
        `Rezervasyon yalnız PAID durumunda tamamlanabilir (mevcut: ${this._status}).`
      );
    }
    this._status = BookingPaymentStatusSchema.enum.BOOKED;
    this._bookingReference = reference;
    this._bookingId = bookingId ?? null;
    this._updatedAt = new Date();
  }

  /** Ödeme alındı ama HotelBeds book başarısız → iade beklenir. */
  public markFailed(reason: string): void {
    this._status = BookingPaymentStatusSchema.enum.FAILED;
    this._failureReason = reason;
    this._updatedAt = new Date();
  }

  /** PENDING → EXPIRED (link süresi doldu, ödeme yapılmadı). */
  public markExpired(): void {
    if (this._status !== BookingPaymentStatusSchema.enum.PENDING) {
      throw new Error(
        `Yalnız PENDING durumundaki kayıt expire edilebilir (mevcut: ${this._status}).`
      );
    }
    this._status = BookingPaymentStatusSchema.enum.EXPIRED;
    this._updatedAt = new Date();
  }

  public markRefunded(reason?: string): void {
    this._status = BookingPaymentStatusSchema.enum.REFUNDED;
    if (reason) this._failureReason = reason;
    this._updatedAt = new Date();
  }

  // --------------------------------------------------------------- persistence

  public toPersistence(): IBookingPayment {
    return {
      id: this._id.value,
      bookingType: this._bookingType,
      status: this._status,
      saleCurrency: this._saleCurrency.value,
      saleAmount: this._saleAmount.amount,
      tryAmount: this._tryAmount.amount,
      netAmount: this._netAmount.amount,
      fxRate: this._fxRate,
      intent: this._intent,
      iyzicoConversationId: this._iyzicoConversationId,
      iyzicoToken: this._iyzicoToken,
      iyzicoUrl: this._iyzicoUrl?.value ?? null,
      stripeSessionId: this._stripeSessionId,
      stripeUrl: this._stripeUrl?.value ?? null,
      paidProvider: this._paidProvider,
      paidProviderRef: this._paidProviderRef,
      paidAt: this._paidAt,
      bookingReference: this._bookingReference,
      bookingId: this._bookingId,
      failureReason: this._failureReason,
      clinicId: this._clinicId.value,
      organizationId: this._organizationId.value,
      patientId: this._patientId?.value ?? null,
      leadId: this._leadId?.value ?? null,
      conversationId: this._conversationId,
      createdAt: this._createdAt,
      updatedAt: DateTimeManager.create(),
    };
  }
}

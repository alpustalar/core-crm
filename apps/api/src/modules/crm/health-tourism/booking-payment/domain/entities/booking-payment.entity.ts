import { BookingPayment as IBookingPayment } from '@shared/generated-zod';
import { Prisma } from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import {
  BookingIntent,
  BookingPaymentLinks,
  BookingPaymentProviderValue,
  BookingPaymentStatusValue,
  BookingPaymentTypeValue,
  CreateBookingPaymentProps,
  Currency,
} from '../booking-payment.contracts';

type Decimal = IBookingPayment['saleAmount'];

/**
 * Sağlık turizmi ödeme-önce (payment-first) tahsilat saga kaydı. Hasta ödeme yapmadan
 * HotelBeds rezervasyonu açılmaz. Durum makinesi:
 * PENDING → (ödeme) PAID → (HotelBeds book) BOOKED | (hata) FAILED ; PENDING → EXPIRED ;
 * herhangi → REFUNDED. Çift-çekim (iki link de ödenirse) ikinci ödeme iade edilir.
 */
export class BookingPayment extends AggregateRoot implements IBookingPayment {
  constructor(data: IBookingPayment) {
    super();
    this._id = data.id;
    this._bookingType = data.bookingType;
    this._status = data.status;
    this._saleCurrency = data.saleCurrency;
    this._saleAmount = data.saleAmount;
    this._tryAmount = data.tryAmount;
    this._netAmount = data.netAmount;
    this._fxRate = data.fxRate;
    this._intent = data.intent;
    this._iyzicoConversationId = data.iyzicoConversationId;
    this._iyzicoToken = data.iyzicoToken;
    this._iyzicoUrl = data.iyzicoUrl;
    this._stripeSessionId = data.stripeSessionId;
    this._stripeUrl = data.stripeUrl;
    this._paidProvider = data.paidProvider;
    this._paidProviderRef = data.paidProviderRef;
    this._paidAt = data.paidAt;
    this._bookingReference = data.bookingReference;
    this._bookingId = data.bookingId;
    this._failureReason = data.failureReason;
    this._clinicId = data.clinicId;
    this._organizationId = data.organizationId;
    this._patientId = data.patientId;
    this._leadId = data.leadId;
    this._conversationId = data.conversationId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
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

  private _saleAmount: Decimal;
  get saleAmount(): Decimal {
    return this._saleAmount;
  }

  private _tryAmount: Decimal;
  get tryAmount(): Decimal {
    return this._tryAmount;
  }

  private _netAmount: Decimal;
  get netAmount(): Decimal {
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

  private _iyzicoUrl: string | null;
  get iyzicoUrl(): string | null {
    return this._iyzicoUrl;
  }

  private _stripeSessionId: string | null;
  get stripeSessionId(): string | null {
    return this._stripeSessionId;
  }

  private _stripeUrl: string | null;
  get stripeUrl(): string | null {
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

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
  }

  private _patientId: string | null;
  get patientId(): string | null {
    return this._patientId;
  }

  private _leadId: string | null;
  get leadId(): string | null {
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
      status: 'PENDING',
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
      clinicId: props.clinicId,
      organizationId: props.organizationId,
      patientId: props.patientId,
      leadId: props.leadId,
      conversationId: props.conversationId,
      createdAt: now,
      updatedAt: now,
    });
  }

  // ------------------------------------------------------------ state machine

  /** initiate sırasında üretilen sağlayıcı link bilgilerini saklar. */
  public attachLinks(links: BookingPaymentLinks): void {
    if (links.iyzicoConversationId !== undefined) {
      this._iyzicoConversationId = links.iyzicoConversationId;
    }
    if (links.iyzicoToken !== undefined) this._iyzicoToken = links.iyzicoToken;
    if (links.iyzicoUrl !== undefined) this._iyzicoUrl = links.iyzicoUrl;
    if (links.stripeSessionId !== undefined) {
      this._stripeSessionId = links.stripeSessionId;
    }
    if (links.stripeUrl !== undefined) this._stripeUrl = links.stripeUrl;
    this._updatedAt = new Date();
  }

  public isPending(): boolean {
    return this._status === 'PENDING';
  }

  public isPaid(): boolean {
    return this._status === 'PAID';
  }

  public isSettled(): boolean {
    return this._status === 'PAID' || this._status === 'BOOKED';
  }

  /** PENDING → PAID. providerRef iade için saklanır. */
  public markPaid(
    provider: BookingPaymentProviderValue,
    providerRef: string
  ): void {
    if (this._status !== 'PENDING') {
      throw new Error(
        `Ödeme yalnız PENDING durumunda işaretlenebilir (mevcut: ${this._status}).`
      );
    }
    this._status = 'PAID';
    this._paidProvider = provider;
    this._paidProviderRef = providerRef;
    this._paidAt = new Date();
    this._updatedAt = new Date();
  }

  /** PAID → BOOKED. HotelBeds rezervasyonu tamamlandı. */
  public markBooked(reference: string, bookingId?: string | null): void {
    if (this._status !== 'PAID') {
      throw new Error(
        `Rezervasyon yalnız PAID durumunda tamamlanabilir (mevcut: ${this._status}).`
      );
    }
    this._status = 'BOOKED';
    this._bookingReference = reference;
    this._bookingId = bookingId ?? null;
    this._updatedAt = new Date();
  }

  /** Ödeme alındı ama HotelBeds book başarısız → iade beklenir. */
  public markFailed(reason: string): void {
    this._status = 'FAILED';
    this._failureReason = reason;
    this._updatedAt = new Date();
  }

  /** PENDING → EXPIRED (link süresi doldu, ödeme yapılmadı). */
  public markExpired(): void {
    if (this._status !== 'PENDING') {
      throw new Error(
        `Yalnız PENDING durumundaki kayıt expire edilebilir (mevcut: ${this._status}).`
      );
    }
    this._status = 'EXPIRED';
    this._updatedAt = new Date();
  }

  public markRefunded(reason?: string): void {
    this._status = 'REFUNDED';
    if (reason) this._failureReason = reason;
    this._updatedAt = new Date();
  }

  // --------------------------------------------------------------- persistence

  public toPersistence(): IBookingPayment {
    return {
      id: this._id,
      bookingType: this._bookingType,
      status: this._status,
      saleCurrency: this._saleCurrency,
      saleAmount: this._saleAmount,
      tryAmount: this._tryAmount,
      netAmount: this._netAmount,
      fxRate: this._fxRate,
      intent: this._intent,
      iyzicoConversationId: this._iyzicoConversationId,
      iyzicoToken: this._iyzicoToken,
      iyzicoUrl: this._iyzicoUrl,
      stripeSessionId: this._stripeSessionId,
      stripeUrl: this._stripeUrl,
      paidProvider: this._paidProvider,
      paidProviderRef: this._paidProviderRef,
      paidAt: this._paidAt,
      bookingReference: this._bookingReference,
      bookingId: this._bookingId,
      failureReason: this._failureReason,
      clinicId: this._clinicId,
      organizationId: this._organizationId,
      patientId: this._patientId,
      leadId: this._leadId,
      conversationId: this._conversationId,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}

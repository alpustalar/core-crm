import { Decimal } from 'decimal.js';
import { CashSession as ICashSession } from '@model-schema/CashSessionSchema';
import {
  CashSessionStatusSchema,
  CashSessionStatusType as CashSessionStatus,
} from '@input-type-schemas/CashSessionStatusSchema';
import { CurrencyType as Currency } from '@input-type-schemas/CurrencySchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import {
  CloseCashSessionInput,
  OpenCashSessionProps,
} from '@modules/finance/cash-register/domain/contracts/cash-register.contracts';
import { CashSessionNotOpenException } from '@modules/finance/cash-register/domain/exceptions/cash-register.exceptions';

/**
 * Kasa Oturumu (aggregate root). Bir kasanın günlük/vardiyalık nakit döngüsü:
 * açılış nakdiyle açılır, hareketler kaydedilir, kapanışta fiziki sayım ile
 * beklenen tutar karşılaştırılıp fark (fazla/açık) hesaplanır.
 */
export class CashSession extends AggregateRoot {
  constructor(data: ICashSession) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._cashRegisterId = UUID.fromTrusted(data.cashRegisterId);
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._organizationId = UUID.fromTrusted(data.organizationId);
    this._status = data.status;
    this._currency = data.currency;
    this._openingFloat = new Decimal(data.openingFloat.toString());
    this._expectedAmount = data.expectedAmount
      ? new Decimal(data.expectedAmount.toString())
      : null;
    this._countedAmount = data.countedAmount
      ? new Decimal(data.countedAmount.toString())
      : null;
    this._difference = data.difference
      ? new Decimal(data.difference.toString())
      : null;
    this._openedById = data.openedById;
    this._closedById = data.closedById;
    this._openedAt = data.openedAt;
    this._closedAt = data.closedAt;
    this._accountingEventId = data.accountingEventId;
    this._postedToAccountingAt = data.postedToAccountingAt;
    this._note = data.note;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _cashRegisterId: UUID;
  get cashRegisterId(): UUID {
    return this._cashRegisterId;
  }

  private _clinicId: UUID;
  get clinicId(): UUID {
    return this._clinicId;
  }

  private _organizationId: UUID;
  get organizationId(): UUID {
    return this._organizationId;
  }

  private _status: CashSessionStatus;
  get status(): CashSessionStatus {
    return this._status;
  }

  private _currency: Currency;
  get currency(): Currency {
    return this._currency;
  }

  private _openingFloat: Decimal;
  get openingFloat(): Decimal {
    return this._openingFloat;
  }

  private _expectedAmount: Decimal | null;
  get expectedAmount(): Decimal | null {
    return this._expectedAmount;
  }

  private _countedAmount: Decimal | null;
  get countedAmount(): Decimal | null {
    return this._countedAmount;
  }

  private _difference: Decimal | null;
  get difference(): Decimal | null {
    return this._difference;
  }

  private _openedById: string;
  get openedById(): string {
    return this._openedById;
  }

  private _closedById: string | null;
  get closedById(): string | null {
    return this._closedById;
  }

  private _openedAt: Date;
  get openedAt(): Date {
    return this._openedAt;
  }

  private _closedAt: Date | null;
  get closedAt(): Date | null {
    return this._closedAt;
  }

  private _accountingEventId: string | null;
  get accountingEventId(): string | null {
    return this._accountingEventId;
  }

  private _postedToAccountingAt: Date | null;
  get postedToAccountingAt(): Date | null {
    return this._postedToAccountingAt;
  }

  private _note: string | null;
  get note(): string | null {
    return this._note;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  public static open(props: OpenCashSessionProps): CashSession {
    const now = DateTimeManager.create();
    const id = UUID.createOrGenerate(props.id).value;

    return new CashSession({
      id,
      cashRegisterId: UUID.create(props.cashRegisterId).orThrow().value,
      clinicId: UUID.create(props.clinicId).orThrow().value,
      organizationId: UUID.create(props.organizationId).orThrow().value,
      status: CashSessionStatusSchema.enum.OPEN,
      currency: props.currency,
      openingFloat: new Decimal(props.openingFloat),
      expectedAmount: null,
      countedAmount: null,
      difference: null,
      openedById: UUID.create(props.openedById).orThrow().value,
      closedById: null,
      openedAt: now,
      closedAt: null,
      accountingEventId: null,
      postedToAccountingAt: null,
      note: props.note ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public isOpen(): boolean {
    return this._status === CashSessionStatusSchema.enum.OPEN;
  }

  /** Hareket kaydı ve kapanış için oturumun açık olmasını zorunlu kılar. */
  public assertOpen(): void {
    if (!this.isOpen()) {
      throw new CashSessionNotOpenException(this._status);
    }
  }

  /**
   * Oturumu kapatır: beklenen tutar = açılış + net hareket; fark = sayım − beklenen.
   * Pozitif fark fazla, negatif fark açık (kasa eksiği) anlamına gelir.
   */
  public close(input: CloseCashSessionInput): void {
    this.assertOpen();

    const expected = this._openingFloat
      .plus(input.totalIn)
      .minus(input.totalOut);
    const difference = input.countedAmount.minus(expected);

    this._expectedAmount = expected;
    this._countedAmount = input.countedAmount;
    this._difference = difference;
    this._status = CashSessionStatusSchema.enum.CLOSED;
    this._closedById = input.closedById;
    this._closedAt = DateTimeManager.create();
    this._updatedAt = DateTimeManager.create();
  }

  public isPostedToAccounting(): boolean {
    return this._accountingEventId !== null;
  }

  /**
   * Kasa→muhasebe köprüsü izi. Kapanıştan sonra, üretilen FinancialEvent id'siyle
   * çağrılır (journal fişi bu olaydan türetilir). İdempotent: zaten postlanmışsa
   * no-op — mükerrer köprü / yarıda-kalma koruması.
   */
  public markAsPostedToAccounting(input: { accountingEventId: string }): void {
    if (this._accountingEventId) return;
    const now = DateTimeManager.create();
    this._accountingEventId = input.accountingEventId;
    this._postedToAccountingAt = now;
    this._updatedAt = now;
  }

  public toPersistence(): ICashSession {
    return {
      id: this._id.value,
      cashRegisterId: this._cashRegisterId.value,
      clinicId: this._clinicId.value,
      organizationId: this._organizationId.value,
      status: this._status,
      currency: this._currency,
      openingFloat: this._openingFloat,
      expectedAmount: this._expectedAmount,
      countedAmount: this._countedAmount,
      difference: this._difference,
      openedById: this._openedById,
      closedById: this._closedById,
      openedAt: this._openedAt,
      closedAt: this._closedAt,
      accountingEventId: this._accountingEventId,
      postedToAccountingAt: this._postedToAccountingAt,
      note: this._note,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

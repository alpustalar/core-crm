import { Decimal } from 'decimal.js';
import { TreatmentCharge as ITreatmentCharge } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Money } from '@src/domain/value-objects/money.vo';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import {
  ApplyDiscountProps,
  CreateTreatmentChargeProps,
  VoidChargeProps,
} from '@modules/finance/treatment-charge/domain/contracts/treatment-charge.contracts';
import {
  DiscountLimitExceededException,
  TreatmentChargeAlreadyVoidedException,
} from '@modules/finance/treatment-charge/domain/exceptions/treatment-charge.exceptions';

/**
 * Randevuda yapılan işlemin fiyatlı satırı.
 *
 * **Donmuş fiyat ilkesi:** `listPrice` satır doğarken tedaviden kopyalanır ve bir
 * daha değişmez. Tedaviye sonradan yapılan zam geçmiş satırları etkilemez —
 * aksi hâlde kesilmiş bir faturanın dayanağı geriye dönük değişirdi.
 *
 * **İndirim burada yaşar,** hastanın üstünde değil: aynı hasta bir işlemde
 * indirim alıp diğerinde almayabilir, ve her indirim kimin verdiği/neden
 * verildiğiyle birlikte kayıt altındadır.
 */
export class TreatmentCharge extends AggregateRoot {
  constructor(data: ITreatmentCharge) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._organizationId = UUID.fromTrusted(data.organizationId);
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._appointmentId = UUID.fromTrusted(data.appointmentId);
    this._patientId = UUID.fromTrusted(data.patientId);
    this._treatmentId = UUID.fromTrusted(data.treatmentId);

    this._description = data.description;
    this._quantity = new Decimal(data.quantity.toString());

    this._listPrice = Money.fromTrusted(
      data.listPrice.toString(),
      data.currency
    );
    this._discountRate = new Decimal(data.discountRate.toString());
    this._discountAmount = Money.fromTrusted(
      data.discountAmount.toString(),
      data.currency
    );
    this._discountReason = data.discountReason;
    this._netAmount = Money.fromTrusted(
      data.netAmount.toString(),
      data.currency
    );
    this._vatRate = VatRate.fromTrusted(data.vatRate);
    this._vatAmount = Money.fromTrusted(
      data.vatAmount.toString(),
      data.currency
    );
    this._grossAmount = Money.fromTrusted(
      data.grossAmount.toString(),
      data.currency
    );

    this._discountApprovedById = data.discountApprovedById;
    this._createdById = data.createdById;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._voidedAt = data.voidedAt;
    this._voidReason = data.voidReason;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _organizationId: UUID;
  get organizationId(): UUID {
    return this._organizationId;
  }

  private _clinicId: UUID;
  get clinicId(): UUID {
    return this._clinicId;
  }

  private _appointmentId: UUID;
  get appointmentId(): UUID {
    return this._appointmentId;
  }

  private _patientId: UUID;
  get patientId(): UUID {
    return this._patientId;
  }

  private _treatmentId: UUID;
  get treatmentId(): UUID {
    return this._treatmentId;
  }

  private _description: string | null;
  get description(): string | null {
    return this._description;
  }

  private _quantity: Decimal;
  get quantity(): Decimal {
    return this._quantity;
  }

  private _listPrice: Money;
  get listPrice(): Money {
    return this._listPrice;
  }

  private _discountRate: Decimal;
  get discountRate(): Decimal {
    return this._discountRate;
  }

  private _discountAmount: Money;
  get discountAmount(): Money {
    return this._discountAmount;
  }

  private _discountReason: string | null;
  get discountReason(): string | null {
    return this._discountReason;
  }

  private _netAmount: Money;
  get netAmount(): Money {
    return this._netAmount;
  }

  private _vatRate: VatRate;
  get vatRate(): VatRate {
    return this._vatRate;
  }

  private _vatAmount: Money;
  get vatAmount(): Money {
    return this._vatAmount;
  }

  private _grossAmount: Money;
  get grossAmount(): Money {
    return this._grossAmount;
  }

  private _discountApprovedById: string | null;
  get discountApprovedById(): string | null {
    return this._discountApprovedById;
  }

  private _createdById: string | null;
  get createdById(): string | null {
    return this._createdById;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  private _voidedAt: Date | null;
  get voidedAt(): Date | null {
    return this._voidedAt;
  }

  private _voidReason: string | null;
  get voidReason(): string | null {
    return this._voidReason;
  }

  /** İndirimsiz satır tutarı: liste fiyatı × adet. */
  get listTotal(): Money {
    return this._listPrice.multiply(this._quantity);
  }

  get isVoided(): boolean {
    return this._voidedAt !== null;
  }

  /**
   * Satırı oluşturur; indirim tavanını doğrular ve tüm parasal alanları hesaplar.
   * Hesap sırası bilinçli: **indirim matraha uygulanır, KDV indirimli tutar
   * üzerinden hesaplanır** — yasal olarak KDV iskonto sonrası bedel üzerinden
   * doğar, önce KDV ekleyip sonra indirim uygulamak matrahı bozar.
   */
  public static create(props: CreateTreatmentChargeProps): TreatmentCharge {
    TreatmentCharge.assertDiscountWithinLimit({
      requested: props.discountRate,
      max: props.maxDiscountPercent,
      canExceed: props.canExceedDiscountLimit,
    });

    const now = DateTimeManager.create();
    const currency = props.listPrice.currency;

    const amounts = TreatmentCharge.calculateAmounts({
      listPrice: props.listPrice,
      quantity: props.quantity,
      discountRate: props.discountRate,
      vatRate: props.vatRate,
    });

    const exceedsLimit = props.discountRate.greaterThan(
      props.maxDiscountPercent
    );

    return new TreatmentCharge({
      id: UUID.createOrGenerate(props.id).value,
      organizationId: props.organizationId,
      clinicId: props.clinicId,
      appointmentId: props.appointmentId,
      patientId: props.patientId,
      treatmentId: props.treatmentId,

      description: props.description ?? null,
      quantity: props.quantity,

      listPrice: props.listPrice.value,
      discountRate: props.discountRate,
      discountAmount: amounts.discountAmount.value,
      discountReason: props.discountReason ?? null,
      netAmount: amounts.netAmount.value,
      vatRate: props.vatRate.value.toNumber(),
      vatAmount: amounts.vatAmount.value,
      grossAmount: amounts.grossAmount.value,
      currency,

      // Tavan aşıldıysa onaylayan yöneticinin izi bırakılır.
      discountApprovedById: exceedsLimit ? (props.createdById ?? null) : null,
      createdById: props.createdById ?? null,
      createdAt: now,
      updatedAt: now,
      voidedAt: null,
      voidReason: null,
    });
  }

  /**
   * İndirimi değiştirir ve tüm tutarları yeniden hesaplar. Liste fiyatı ve KDV
   * oranı dokunulmaz — pazarlık payı yalnız indirimdir.
   */
  public applyDiscount(props: ApplyDiscountProps): void {
    this.assertNotVoided();

    TreatmentCharge.assertDiscountWithinLimit({
      requested: props.discountRate,
      max: props.maxDiscountPercent,
      canExceed: props.canExceedDiscountLimit,
    });

    const amounts = TreatmentCharge.calculateAmounts({
      listPrice: this._listPrice,
      quantity: this._quantity,
      discountRate: props.discountRate,
      vatRate: this._vatRate,
    });

    this._discountRate = props.discountRate;
    this._discountAmount = amounts.discountAmount;
    this._discountReason = props.discountReason ?? null;
    this._netAmount = amounts.netAmount;
    this._vatAmount = amounts.vatAmount;
    this._grossAmount = amounts.grossAmount;

    this._discountApprovedById = props.discountRate.greaterThan(
      props.maxDiscountPercent
    )
      ? (props.actorId ?? null)
      : null;

    this._updatedAt = DateTimeManager.create();
  }

  /** Satırı iptal eder. Kayıt silinmez; toplamlara girmez hâle gelir. */
  public void(props: VoidChargeProps): void {
    this.assertNotVoided();

    this._voidedAt = DateTimeManager.create();
    this._voidReason = props.reason;
    this._updatedAt = this._voidedAt;
  }

  public toPersistence(): ITreatmentCharge {
    return {
      id: this._id.value,
      organizationId: this._organizationId.value,
      clinicId: this._clinicId.value,
      appointmentId: this._appointmentId.value,
      patientId: this._patientId.value,
      treatmentId: this._treatmentId.value,

      description: this._description,
      quantity: this._quantity,

      listPrice: this._listPrice.value,
      discountRate: this._discountRate,
      discountAmount: this._discountAmount.value,
      discountReason: this._discountReason,
      netAmount: this._netAmount.value,
      vatRate: this._vatRate.value.toNumber(),
      vatAmount: this._vatAmount.value,
      grossAmount: this._grossAmount.value,
      currency: this._listPrice.currency,

      discountApprovedById: this._discountApprovedById,
      createdById: this._createdById,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      voidedAt: this._voidedAt,
      voidReason: this._voidReason,
    };
  }

  /**
   * Tutar hesabının tek kaynağı. `create` ve `applyDiscount` aynı motoru
   * kullanır ki iki yol arasında sapma oluşmasın.
   */
  private static calculateAmounts(input: CalculateAmountsInput): {
    discountAmount: Money;
    netAmount: Money;
    vatAmount: Money;
    grossAmount: Money;
  } {
    const listTotal = input.listPrice.multiply(input.quantity);

    const discountValue = listTotal.value
      .mul(input.discountRate)
      .div(100)
      .toDecimalPlaces(2);

    const discountAmount = Money.fromTrusted(
      discountValue,
      input.listPrice.currency
    );

    // Matrah = liste toplamı − indirim (KDV bu tutar üzerinden doğar)
    const netAmount = listTotal.subtract(discountAmount);
    const vatAmount = Money.fromTrusted(
      netAmount.value.mul(input.vatRate.asMultiplier).toDecimalPlaces(2),
      input.listPrice.currency
    );

    return {
      discountAmount,
      netAmount,
      vatAmount,
      grossAmount: netAmount.add(vatAmount),
    };
  }

  /**
   * İndirim tavanı kuralı. Tavan personel için mutlaktır; yalnız kliniği yöneten
   * aktör (klinik sahibi / şube müdürü) aşabilir.
   */
  private static assertDiscountWithinLimit(input: AssertDiscountInput): void {
    if (input.canExceed) return;
    if (!input.requested.greaterThan(input.max)) return;

    throw new DiscountLimitExceededException({
      requestedRate: input.requested.toNumber(),
      maxAllowedRate: input.max.toNumber(),
      overridableByManager: true,
    });
  }

  private assertNotVoided(): void {
    if (this.isVoided) {
      throw new TreatmentChargeAlreadyVoidedException(this._id.value);
    }
  }
}

interface CalculateAmountsInput {
  listPrice: Money;
  quantity: Decimal;
  discountRate: Decimal;
  vatRate: VatRate;
}

interface AssertDiscountInput {
  requested: Decimal;
  max: Decimal;
  canExceed: boolean;
}

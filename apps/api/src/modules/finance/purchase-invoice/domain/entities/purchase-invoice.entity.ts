import { PurchaseInvoice as IPurchaseInvoice } from '@model-schema/PurchaseInvoiceSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { Money } from '@src/domain/value-objects/money.vo';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { PurchaseInvoiceStatusSchema } from '@shared';
import { PurchaseInvoiceStatusType } from '@input-type-schemas/PurchaseInvoiceStatusSchema';
import { CreatePurchaseInvoiceProps } from '@modules/finance/purchase-invoice/domain/contracts/purchase-invoice.contracts';
import {
  PurchaseInvoiceAlreadyMatchedException,
  PurchaseInvoiceNotMatchableException,
  PurchaseInvoiceNotMatchedException,
} from '@modules/finance/purchase-invoice/domain/exceptions/purchase-invoice.exceptions';

/**
 * Tedarikçiden alınan alış faturası. Satış faturasının kardeşi; dış belge
 * sağlayıcı yoktur — faturayı biz alır kaydederiz. Kayıt sonrası köprü
 * PURCHASE_INVOICE_RECEIVED olayını yazar; posting 150/770 + 191 / 320 fişini üretir.
 */

export class PurchaseInvoice extends AggregateRoot {
  constructor(data: IPurchaseInvoice) {
    super();
    const currency = data.currency;
    this._id = UUID.fromTrusted(data.id);
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._organizationId = UUID.fromTrusted(data.organizationId);
    this._supplierId = UUID.fromTrusted(data.supplierId);
    this._invoiceNumber = data.invoiceNumber;
    this._invoiceDate = data.invoiceDate;
    this._purchaseOrderId = data.purchaseOrderId;
    this._lineAccountCode = data.lineAccountCode;
    this._vatRate = VatRate.fromTrusted(data.vatRate);
    this._netTotal = Money.fromTrusted(data.netTotal, currency);
    this._vatTotal = Money.fromTrusted(data.vatTotal, currency);
    this._grandTotal = Money.fromTrusted(data.grandTotal, currency);
    this._status = data.status;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _clinicId: UUID;
  get clinicId(): UUID {
    return this._clinicId;
  }

  private _organizationId: UUID;
  get organizationId(): UUID {
    return this._organizationId;
  }

  private _supplierId: UUID;
  get supplierId(): UUID {
    return this._supplierId;
  }

  private _invoiceNumber: string | null;
  get invoiceNumber(): string | null {
    return this._invoiceNumber;
  }

  private _invoiceDate: Date;
  get invoiceDate(): Date {
    return this._invoiceDate;
  }

  private _purchaseOrderId: string | null;
  get purchaseOrderId(): string | null {
    return this._purchaseOrderId;
  }

  get isMatched(): boolean {
    return this._purchaseOrderId !== null;
  }

  private _lineAccountCode: string;
  get lineAccountCode(): string {
    return this._lineAccountCode;
  }

  private _vatRate: VatRate;
  get vatRate(): VatRate {
    return this._vatRate;
  }

  private _netTotal: Money;
  get netTotal(): Money {
    return this._netTotal;
  }

  private _vatTotal: Money;
  get vatTotal(): Money {
    return this._vatTotal;
  }

  private _grandTotal: Money;
  get grandTotal(): Money {
    return this._grandTotal;
  }

  get currency(): CurrencyType {
    return this.grandTotal.currency;
  }

  private _status: PurchaseInvoiceStatusType;
  get status(): PurchaseInvoiceStatusType {
    return this._status;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  public static create(props: CreatePurchaseInvoiceProps): PurchaseInvoice {
    const now = DateTimeManager.create();

    return new PurchaseInvoice({
      id: UUID.createOrGenerate(props.id).value,
      clinicId: UUID.create(props.clinicId).orThrow().value,
      organizationId: UUID.create(props.organizationId).orThrow().value,
      supplierId: UUID.create(props.supplierId).orThrow().value,
      invoiceNumber: props.invoiceNumber,
      invoiceDate: props.invoiceDate,
      purchaseOrderId: props.purchaseOrderId ?? null,
      lineAccountCode: props.lineAccountCode,
      vatRate: VatRate.create(props.vatRate).orThrow().value.toNumber(),
      netTotal: Money.create(props.netTotal, props.currency).orThrow().value,
      vatTotal: Money.create(props.vatTotal, props.currency).orThrow().value,
      grandTotal: Money.create(props.grandTotal, props.currency).orThrow()
        .value,
      currency: Currency.create(props.currency).orThrow().value,
      status: PurchaseInvoiceStatusSchema.enum.RECORDED,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Faturayı bir satın alma siparişine bağlar. Sipariş tarafındaki tutar sayacı
   * `ApplyInvoiceToPurchaseOrderCommand` ile ayrıca güncellenir; burada yalnız bağ
   * kurulur. Zaten bağlıysa yeniden bağlanamaz — önce eşleştirme kaldırılır, aksi
   * halde eski siparişin sayacı şişik kalırdı.
   */
  public matchToOrder(purchaseOrderId: string): void {
    if (this._purchaseOrderId) {
      throw new PurchaseInvoiceAlreadyMatchedException({
        invoiceId: this._id.value,
        purchaseOrderId: this._purchaseOrderId,
      });
    }
    if (this._status === PurchaseInvoiceStatusSchema.enum.CANCELLED) {
      throw new PurchaseInvoiceNotMatchableException(this._status);
    }

    this._purchaseOrderId = UUID.create(purchaseOrderId).orThrow().value;
    this._updatedAt = DateTimeManager.create();
  }

  /** Bağı koparır (yanlış sipariş / fatura iptali). Sayaç komut tarafında düşülür. */
  public unmatchFromOrder(): string {
    if (!this._purchaseOrderId) {
      throw new PurchaseInvoiceNotMatchedException(this._id.value);
    }

    const previousOrderId = this._purchaseOrderId;
    this._purchaseOrderId = null;
    this._updatedAt = DateTimeManager.create();
    return previousOrderId;
  }

  /** Repo'nun upsert'ine geçilen ham kayıt. Decimal alanlar Prisma'ya DecimalJsLike olarak gider. */
  public toPersistence(): IPurchaseInvoice {
    return {
      id: this.id.value,
      clinicId: this.clinicId.value,
      organizationId: this.organizationId.value,
      supplierId: this.supplierId.value,
      invoiceNumber: this.invoiceNumber,
      invoiceDate: this.invoiceDate,
      purchaseOrderId: this.purchaseOrderId,
      lineAccountCode: this.lineAccountCode,
      vatRate: this.vatRate.value.toNumber(),
      netTotal: this.netTotal.value,
      vatTotal: this.vatTotal.value,
      grandTotal: this.grandTotal.value,
      currency: this.currency,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

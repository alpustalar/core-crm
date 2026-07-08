import { PurchaseInvoice as IPurchaseInvoice } from '@model-schema/PurchaseInvoiceSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { CreatePurchaseInvoiceProps } from '../types/create-purchase-invoice.props';
import { Money } from '@src/domain/value-objects/money.vo';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { PurchaseInvoiceStatusSchema } from '@shared';
import { PurchaseInvoiceStatusType } from '@input-type-schemas/PurchaseInvoiceStatusSchema';

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

    const id = props.id ? UUID.create(props.id).orThrow() : UUID.generate();

    return new PurchaseInvoice({
      id: id.value,
      clinicId: UUID.create(props.clinicId).orThrow().value,
      organizationId: UUID.create(props.organizationId).orThrow().value,
      supplierId: UUID.create(props.supplierId).orThrow().value,
      invoiceNumber: props.invoiceNumber,
      invoiceDate: props.invoiceDate,
      lineAccountCode: props.lineAccountCode,
      vatRate: VatRate.create(props.vatRate).orThrow().value.toNumber(),
      netTotal: Money.create(props.netTotal, props.currency).orThrow().amount,
      vatTotal: Money.create(props.vatTotal, props.currency).orThrow().amount,
      grandTotal: Money.create(props.grandTotal, props.currency).orThrow()
        .amount,
      currency: Currency.create(props.currency).orThrow().value,
      status: PurchaseInvoiceStatusSchema.enum.RECORDED,
      createdAt: now,
      updatedAt: now,
    });
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
      lineAccountCode: this.lineAccountCode,
      vatRate: this.vatRate.value.toNumber(),
      netTotal: this.netTotal.amount,
      vatTotal: this.vatTotal.amount,
      grandTotal: this.grandTotal.amount,
      currency: this.currency,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

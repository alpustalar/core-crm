import { PurchaseInvoice as IPurchaseInvoice } from '@model-schema/PurchaseInvoiceSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { CreatePurchaseInvoiceProps } from '../types/create-purchase-invoice.props';
import { Money } from '@src/domain/value-objects/money.vo';

/**
 * Tedarikçiden alınan alış faturası. Satış faturasının kardeşi; dış belge
 * sağlayıcı yoktur — faturayı biz alır kaydederiz. Kayıt sonrası köprü
 * PURCHASE_INVOICE_RECEIVED olayını yazar; posting 150/770 + 191 / 320 fişini üretir.
 */
export class PurchaseInvoice extends AggregateRoot {
  constructor(data: IPurchaseInvoice) {
    super();
    const currency = data.currency;
    this._id = data.id;
    this._clinicId = data.clinicId;
    this._organizationId = data.organizationId;
    this._supplierId = data.supplierId;
    this._invoiceNumber = data.invoiceNumber;
    this._invoiceDate = data.invoiceDate;
    this._lineAccountCode = data.lineAccountCode;
    this._vatRate = data.vatRate;
    this._netTotal = Money.create(data.netTotal, currency);
    this._vatTotal = Money.create(data.vatTotal, currency);
    this._grandTotal = Money.create(data.grandTotal, currency);
    this._status = data.status;
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

  private _supplierId: string;
  get supplierId(): string {
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

  private _vatRate: number;
  get vatRate(): number {
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

  private _status: string;
  get status(): string {
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
    const now = new Date();

    return new PurchaseInvoice({
      id: props.id,
      clinicId: props.clinicId,
      organizationId: props.organizationId,
      supplierId: props.supplierId,
      invoiceNumber: props.invoiceNumber,
      invoiceDate: props.invoiceDate,
      lineAccountCode: props.lineAccountCode,
      vatRate: props.vatRate,
      netTotal: props.netTotal,
      vatTotal: props.vatTotal,
      grandTotal: props.grandTotal,
      currency: props.currency,
      status: 'RECORDED',
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Repo'nun upsert'ine geçilen ham kayıt. Decimal alanlar Prisma'ya DecimalJsLike olarak gider. */
  public toPersistence() {
    return {
      id: this._id,
      clinicId: this._clinicId,
      organizationId: this._organizationId,
      supplierId: this._supplierId,
      invoiceNumber: this._invoiceNumber,
      invoiceDate: this._invoiceDate,
      lineAccountCode: this._lineAccountCode,
      vatRate: this._vatRate,
      netTotal: this._netTotal.amount,
      vatTotal: this._vatTotal.amount,
      grandTotal: this._grandTotal.amount,
      currency: this._grandTotal.currency,
      status: this._status,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

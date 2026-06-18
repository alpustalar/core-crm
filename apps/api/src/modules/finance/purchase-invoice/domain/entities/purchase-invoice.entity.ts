import { PurchaseInvoice as IPurchaseInvoice } from '@model-schema/PurchaseInvoiceSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { Decimal } from 'decimal.js';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { CreatePurchaseInvoiceProps } from '../types/create-purchase-invoice.props';

/**
 * Tedarikçiden alınan alış faturası. Satış faturasının kardeşi; dış belge
 * sağlayıcı yoktur — faturayı biz alır kaydederiz. Kayıt sonrası köprü
 * PURCHASE_INVOICE_RECEIVED olayını yazar; posting 150/770 + 191 / 320 fişini üretir.
 */
export class PurchaseInvoice extends AggregateRoot {
  constructor(data: IPurchaseInvoice) {
    super();
    this._id = data.id;
    this._clinicId = data.clinicId;
    this._organizationId = data.organizationId;
    this._supplierId = data.supplierId;
    this._invoiceNumber = data.invoiceNumber;
    this._invoiceDate = data.invoiceDate;
    this._lineAccountCode = data.lineAccountCode;
    this._vatRate = data.vatRate;
    this._netTotal = new Decimal(data.netTotal.toString());
    this._vatTotal = new Decimal(data.vatTotal.toString());
    this._grandTotal = new Decimal(data.grandTotal.toString());
    this._currency = data.currency;
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

  private _netTotal: Decimal;
  get netTotal(): Decimal {
    return this._netTotal;
  }

  private _vatTotal: Decimal;
  get vatTotal(): Decimal {
    return this._vatTotal;
  }

  private _grandTotal: Decimal;
  get grandTotal(): Decimal {
    return this._grandTotal;
  }

  private _currency: CurrencyType;
  get currency(): CurrencyType {
    return this._currency;
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
      netTotal: props.netTotal as unknown as IPurchaseInvoice['netTotal'],
      vatTotal: props.vatTotal as unknown as IPurchaseInvoice['vatTotal'],
      grandTotal: props.grandTotal as unknown as IPurchaseInvoice['grandTotal'],
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
      netTotal: this._netTotal,
      vatTotal: this._vatTotal,
      grandTotal: this._grandTotal,
      currency: this._currency,
      status: this._status,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

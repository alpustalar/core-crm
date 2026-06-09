import {
  FinanceLedger as IFinanceLedger,
  LedgerCategory,
  LedgerSource,
  LedgerStatus,
  LedgerType,
  Prisma,
} from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { CreateFinanceLedgerProps } from '../types/create-finance-ledger.props';

export class FinanceLedgerEntity extends AggregateRoot implements IFinanceLedger {
  constructor(data: IFinanceLedger) {
    super();
    this._id = data.id;
    this._organizationId = data.organizationId;
    this._clinicId = data.clinicId;
    this._patientId = data.patientId;
    this._paymentId = data.paymentId;
    this._installmentId = data.installmentId;
    this._performedById = data.performedById;
    this._type = data.type;
    this._source = data.source;
    this._category = data.category;
    this._status = data.status;
    this._amount = data.amount;
    this._currency = data.currency;
    this._taxRate = data.taxRate;
    this._taxAmount = data.taxAmount;
    this._description = data.description;
    this._documentNo = data.documentNo;
    this._entryDate = data.entryDate;
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

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _patientId: string | null;
  get patientId(): string | null {
    return this._patientId;
  }

  private _paymentId: string | null;
  get paymentId(): string | null {
    return this._paymentId;
  }

  private _installmentId: string | null;
  get installmentId(): string | null {
    return this._installmentId;
  }

  private _performedById: string | null;
  get performedById(): string | null {
    return this._performedById;
  }

  private _type: LedgerType;
  get type(): LedgerType {
    return this._type;
  }

  private _source: LedgerSource;
  get source(): LedgerSource {
    return this._source;
  }

  private _category: LedgerCategory;
  get category(): LedgerCategory {
    return this._category;
  }

  private _status: LedgerStatus;
  get status(): LedgerStatus {
    return this._status;
  }

  private _amount: Prisma.Decimal;
  get amount(): Prisma.Decimal {
    return this._amount;
  }

  private _currency: string;
  get currency(): string {
    return this._currency;
  }

  private _taxRate: number;
  get taxRate(): number {
    return this._taxRate;
  }

  private _taxAmount: Prisma.Decimal;
  get taxAmount(): Prisma.Decimal {
    return this._taxAmount;
  }

  private _description: string | null;
  get description(): string | null {
    return this._description;
  }

  private _documentNo: string | null;
  get documentNo(): string | null {
    return this._documentNo;
  }

  private _entryDate: Date;
  get entryDate(): Date {
    return this._entryDate;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  public static create(props: CreateFinanceLedgerProps): FinanceLedgerEntity {
    return new FinanceLedgerEntity({
      id: crypto.randomUUID(),
      organizationId: props.organizationId,
      clinicId: props.clinicId,
      patientId: props.patientId ?? null,
      paymentId: props.paymentId ?? null,
      installmentId: props.installmentId ?? null,
      performedById: props.performedById ?? null,
      type: props.type,
      source: props.source,
      category: props.category,
      status: LedgerStatus.COMPLETED,
      amount: new Prisma.Decimal(props.amount),
      currency: props.currency ?? 'TRY',
      taxRate: props.taxRate ?? 0,
      taxAmount: new Prisma.Decimal(0),
      description: props.description ?? null,
      documentNo: props.documentNo ?? null,
      entryDate: props.entryDate ?? new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public isCompleted(): boolean {
    return this._status === LedgerStatus.COMPLETED;
  }

  public isRefunded(): boolean {
    return this._status === LedgerStatus.REFUNDED;
  }

  public isCancelled(): boolean {
    return this._status === LedgerStatus.CANCELLED;
  }

  public refund(): void {
    if (!this.isCompleted()) {
      throw new Error('Yalnızca tamamlanan kayıtlar iade edilebilir.');
    }
    this._status = LedgerStatus.REFUNDED;
  }

  public cancel(): void {
    if (this.isRefunded() || this.isCancelled()) {
      throw new Error('İade edilmiş veya iptal edilmiş kayıtlar iptal edilemez.');
    }
    this._status = LedgerStatus.CANCELLED;
  }

  public toPersistence(): IFinanceLedger {
    return {
      id: this._id,
      organizationId: this._organizationId,
      clinicId: this._clinicId,
      patientId: this._patientId,
      paymentId: this._paymentId,
      installmentId: this._installmentId,
      performedById: this._performedById,
      type: this._type,
      source: this._source,
      category: this._category,
      status: this._status,
      amount: this._amount,
      currency: this._currency,
      taxRate: this._taxRate,
      taxAmount: this._taxAmount,
      description: this._description,
      documentNo: this._documentNo,
      entryDate: this._entryDate,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}

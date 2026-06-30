import {
  FinanceLedger as IFinanceLedger,
  LedgerStatusSchema,
} from '@shared/generated-zod';
import { LedgerCategoryType as LedgerCategory } from '@shared/generated-zod/inputTypeSchemas/LedgerCategorySchema';
import { LedgerTypeType as LedgerType } from '@shared/generated-zod/inputTypeSchemas/LedgerTypeSchema';
import { LedgerSourceType as LedgerSource } from '@shared/generated-zod/inputTypeSchemas/LedgerSourceSchema';
import { LedgerStatusType as LedgerStatus } from '@shared/generated-zod/inputTypeSchemas/LedgerStatusSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { Money } from '@src/domain/value-objects/money.vo';
import { TaxSpecification } from '@modules/finance/shared/domain/value-objects/tax-specification.vo';
import { CreateFinanceLedgerProps } from '@modules/finance/finance-ledger/domain/finance-ledger.contracts';

export class FinanceLedgerEntity extends AggregateRoot {
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

    const netMoney = Money.create(data.amount, data.currency).orThrow();
    const taxMoney = Money.create(data.taxAmount, data.currency).orThrow();

    this._taxSpecification = TaxSpecification.create(
      netMoney,
      data.taxRate,
      taxMoney
    );

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
  private _taxSpecification: TaxSpecification;
  get taxSpecification(): TaxSpecification {
    return this._taxSpecification;
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

  private _currency: string;
  get currency(): string {
    return this._currency;
  }

  private _taxRate: number;
  get taxRate(): number {
    return this._taxRate;
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
    // 2. Vergi oranını yedirerek kurallara uygun TaxSpecification üretiyoruz (taxAmount içeride hesaplanacak)
    const taxSpec = TaxSpecification.create(props.money, props.taxRate ?? 0);

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
      status: LedgerStatusSchema.enum.COMPLETED,

      amount: taxSpec.netAmount.amount,
      currency: taxSpec.netAmount.currency,
      taxRate: taxSpec.taxRate,
      taxAmount: taxSpec.taxAmount.amount,

      description: props.description ?? null,
      documentNo: props.documentNo ?? null,
      entryDate: props.entryDate ?? new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public isCompleted(): boolean {
    return this._status === LedgerStatusSchema.enum.COMPLETED;
  }

  public isRefunded(): boolean {
    return this._status === LedgerStatusSchema.enum.REFUNDED;
  }

  public isCancelled(): boolean {
    return this._status === LedgerStatusSchema.enum.CANCELLED;
  }

  public refund(): void {
    if (!this.isCompleted()) {
      throw new Error('Yalnızca tamamlanan kayıtlar iade edilebilir.');
    }
    this._status = LedgerStatusSchema.enum.REFUNDED;
  }

  public cancel(): void {
    if (this.isRefunded() || this.isCancelled()) {
      throw new Error(
        'İade edilmiş veya iptal edilmiş kayıtlar iptal edilemez.'
      );
    }
    this._status = LedgerStatusSchema.enum.CANCELLED;
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

      amount: this._taxSpecification.netAmount.amount,
      currency: this._taxSpecification.netAmount.currency,
      taxRate: this._taxSpecification.taxRate,
      taxAmount: this._taxSpecification.taxAmount.amount,

      description: this._description,
      documentNo: this._documentNo,
      entryDate: this._entryDate,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}

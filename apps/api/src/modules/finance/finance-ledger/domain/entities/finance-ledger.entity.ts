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
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { Guard } from '@common/domain/guards';
import { shouldValidate } from '@common/domain/utils/should-validate';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';

export class FinanceLedgerEntity extends AggregateRoot {
  constructor(data: IFinanceLedger) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._organizationId = UUID.fromTrusted(data.organizationId);
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._patientId = UUID.create(data.patientId).instance ?? null;
    this._paymentId = UUID.create(data.paymentId).instance ?? null;
    this._installmentId = UUID.create(data.installmentId).instance ?? null;
    this._performedById = UUID.create(data.performedById).instance ?? null;
    this._type = data.type;
    this._source = data.source;
    this._category = data.category;
    this._status = data.status;

    const netMoney = Money.fromTrusted(data.amount, data.currency);
    const taxMoney = Money.fromTrusted(data.taxAmount, data.currency);

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

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _organizationId: UUID;
  get organizationId(): UUID {
    return this._organizationId;
  }
  private _taxSpecification: TaxSpecification;
  get taxSpecification(): TaxSpecification {
    return this._taxSpecification;
  }

  private _clinicId: UUID;
  get clinicId(): UUID {
    return this._clinicId;
  }

  private _patientId: UUID | null;
  get patientId(): UUID | null {
    return this._patientId;
  }

  private _paymentId: UUID | null;
  get paymentId(): UUID | null {
    return this._paymentId;
  }

  private _installmentId: UUID | null;
  get installmentId(): UUID | null {
    return this._installmentId;
  }

  private _performedById: UUID | null;
  get performedById(): UUID | null {
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

  get amount(): Money {
    return this.taxSpecification.netAmount;
  }

  get currency(): Currency {
    return Currency.fromTrusted(this.taxSpecification.netAmount.currency);
  }
  get taxRate(): number {
    return this.taxSpecification.taxRate;
  }

  get taxAmount(): Money {
    return this.taxSpecification.taxAmount;
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

  public get validate() {
    return {
      isCompleted: (msg?: string) => this.isCompleted(msg),
      isRefunded: (msg?: string) => this.isRefunded(msg),
      isCancelled: (msg?: string) => this.isCancelled(msg),
    };
  }

  public static create(props: CreateFinanceLedgerProps): FinanceLedgerEntity {
    const taxSpec = TaxSpecification.create(props.money, props.taxRate ?? 0);

    return new FinanceLedgerEntity({
      id: UUID.createOrGenerate(props.id).value,
      organizationId: UUID.create(props.organizationId).orThrow().value,
      clinicId: UUID.create(props.clinicId).orThrow().value,

      patientId: props.patientId
        ? UUID.create(props.patientId).orThrow().value
        : null,

      paymentId: props.paymentId
        ? UUID.create(props.paymentId).orThrow().value
        : null,

      installmentId: props.installmentId
        ? UUID.create(props.installmentId).orThrow().value
        : null,

      performedById: props.performedById
        ? UUID.create(props.performedById).orThrow().value
        : null,

      type: props.type,
      source: props.source,
      category: props.category,
      status: LedgerStatusSchema.enum.COMPLETED,

      amount: taxSpec.netAmount.value,
      currency: taxSpec.netAmount.currency,
      taxRate: taxSpec.taxRate,
      taxAmount: taxSpec.taxAmount.value,

      description: props.description ?? null,
      documentNo: props.documentNo ?? null,
      entryDate: props.entryDate ?? DateTimeManager.create(),
      createdAt: DateTimeManager.create(),
      updatedAt: DateTimeManager.create(),
    });
  }

  public refund(validateOptions = DefaultValidateOptions): void {
    if (shouldValidate(validateOptions))
      this.isCompleted(
        'Yalnızca tamamlanan kayıtlar iade edilebilir.'
      ).orThrow();

    this._status = LedgerStatusSchema.enum.REFUNDED;
  }

  public cancel(validateOptions = DefaultValidateOptions): void {
    if (shouldValidate(validateOptions))
      this.isRefunded('İade edilmiş kayıtlar iptal edilemez').orThrow();

    const isCancelled = this.isCancelled().value;
    if (isCancelled) return;

    this._status = LedgerStatusSchema.enum.CANCELLED;
  }

  public toPersistence(): IFinanceLedger {
    return {
      id: this.id.value,
      organizationId: this.organizationId.value,
      clinicId: this.clinicId.value,
      patientId: this.patientId?.value ?? null,
      paymentId: this.paymentId?.value ?? null,
      installmentId: this.installmentId?.value ?? null,
      performedById: this.performedById?.value ?? null,
      type: this.type,
      source: this.source,
      category: this.category,
      status: this.status,

      amount: this.amount.value,
      currency: this.currency.value,
      taxRate: this.taxRate,
      taxAmount: this.taxAmount.value,
      description: this.description,
      documentNo: this.documentNo,
      entryDate: this.entryDate,
      createdAt: this.createdAt,
      updatedAt: DateTimeManager.create(),
    };
  }

  private isCompleted(msg?: string): Guard<boolean> {
    const is = this._status === LedgerStatusSchema.enum.COMPLETED;
    return Guard.monitor(is, is, () => new Error(msg ?? 'Tamamlanmamış'));
  }

  private isRefunded(msg?: string): Guard<boolean> {
    const is = this._status === LedgerStatusSchema.enum.REFUNDED;
    return Guard.monitor(is, is, () => new Error(msg ?? 'İade edilmemiş'));
  }

  private isCancelled(msg?: string): Guard<boolean> {
    const is = this._status === LedgerStatusSchema.enum.CANCELLED;
    return Guard.monitor(is, is, () => new Error(msg ?? 'İptal edilmemiş'));
  }
}

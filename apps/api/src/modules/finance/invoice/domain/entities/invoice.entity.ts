import { Invoice as IInvoice } from '@model-schema/InvoiceSchema';
import {
  InvoiceStatusSchema,
  InvoiceStatusType as InvoiceStatus,
} from '@input-type-schemas/InvoiceStatusSchema';
import { EDocumentTypeType as EDocumentType } from '@input-type-schemas/EDocumentTypeSchema';
import { EDocumentStatusType as EDocumentStatus } from '@input-type-schemas/EDocumentStatusSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { InvoiceIssuedEvent } from '../events/invoice-issued.event';
import { InvoiceFailedEvent } from '../events/invoice-failed.event';
import { TaxSpecification } from '@modules/finance/shared/domain/value-objects/tax-specification.vo';
import { Money } from '@src/domain/value-objects/money.vo';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { InvoiceNumber } from '@modules/finance/invoice/domain/value-objects/invoice-number.vo';
import { Decimal } from 'decimal.js';
import { JsonValueType as JsonValue } from '@input-type-schemas/JsonValueSchema';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import {
  ApplyEDocumentResultProps,
  FailInvoiceEntityProps,
  IssueInvoiceEntityProps,
} from '@modules/finance/invoice/domain/invoice.contracts';

export class Invoice extends AggregateRoot {
  constructor(data: IInvoice) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._patientId = UUID.fromTrusted(data.patientId);
    this._appointmentId = UUID.create(data.appointmentId).instance ?? null;
    this._paymentId = UUID.create(data.paymentId).instance ?? null;
    this._currency = Currency.fromTrusted(data.currency);
    this._vatRate = VatRate.fromTrusted(data.vatRate);
    this._status = data.status;
    this._invoiceNumber = data.invoiceNumber
      ? InvoiceNumber.create(data.invoiceNumber)
      : null;
    this._issuedAt = data.issuedAt;
    this._providerRef = data.providerRef;
    this._documentType = data.documentType;
    this._einvoiceUuid = UUID.create(data.einvoiceUuid).instance ?? null;
    this._einvoiceStatus = data.einvoiceStatus;
    this._rawResponse = data.rawResponse;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._isDeleted = data.isDeleted;
    this._taxSpecification = TaxSpecification.create(
      Money.fromTrusted(data.netTotal, data.currency),
      data.vatRate,
      Money.fromTrusted(data.vatTotal, data.currency)
    );
  }

  private _id: UUID;

  get id(): UUID {
    return this._id;
  }

  private _clinicId: UUID;

  get clinicId(): UUID {
    return this._clinicId;
  }

  private _patientId: UUID;

  get patientId(): UUID {
    return this._patientId;
  }

  private _appointmentId: UUID | null;

  get appointmentId(): UUID | null {
    return this._appointmentId;
  }

  get amount(): Decimal {
    return this._taxSpecification.grossAmount.amount;
  }

  private _taxSpecification: TaxSpecification;

  get taxSpecification(): TaxSpecification {
    return this._taxSpecification;
  }

  private _paymentId: UUID | null;

  get paymentId(): UUID | null {
    return this._paymentId;
  }

  private _currency: Currency;

  get currency(): Currency {
    return this._currency;
  }

  private _vatRate: VatRate;

  get vatRate(): VatRate {
    return this._vatRate;
  }

  private _status: InvoiceStatus;
  get status(): InvoiceStatus {
    return this._status;
  }

  private _invoiceNumber: InvoiceNumber | null;
  get invoiceNumber(): InvoiceNumber | null {
    return this._invoiceNumber;
  }

  private _issuedAt: Date | null;
  get issuedAt(): Date | null {
    return this._issuedAt;
  }

  private _providerRef: string | null;
  get providerRef(): string | null {
    return this._providerRef;
  }

  private _documentType: EDocumentType | null;
  get documentType(): EDocumentType | null {
    return this._documentType;
  }

  private _einvoiceUuid: UUID | null;
  get einvoiceUuid(): UUID | null {
    return this._einvoiceUuid;
  }

  private _einvoiceStatus: EDocumentStatus;
  get einvoiceStatus(): EDocumentStatus {
    return this._einvoiceStatus;
  }

  public get totalDue(): Money {
    return this._taxSpecification.grossAmount;
  }

  private _rawResponse: JsonValue | null;
  get rawResponse(): JsonValue | null {
    return this._rawResponse;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  private _isDeleted: boolean;
  get isDeleted(): boolean {
    return this._isDeleted;
  }

  /**
   * KDV dahil genel toplamı matrah + KDV'ye ayırır.
   * net = grand / (1 + oran/100) (2 haneye yuvarlanır), KDV = grand - net.
   */

  public isPending(): boolean {
    return this._status === InvoiceStatusSchema.enum.PENDING;
  }

  public isIssued(): boolean {
    return this._status === InvoiceStatusSchema.enum.ISSUED;
  }

  public issue(props: IssueInvoiceEntityProps): void {
    if (!this.isPending()) {
      throw new Error('Yalnızca bekleyen faturalar kesilebilir.');
    }
    this._status = InvoiceStatusSchema.enum.ISSUED;
    this._invoiceNumber = InvoiceNumber.create(props.invoiceNumber);
    this._providerRef = props.providerRef;
    this._issuedAt = props.issuedAt;
    if (props.rawResponse !== undefined) {
      this._rawResponse = props.rawResponse as JsonValue;
    }
    this.addDomainEvent(
      new InvoiceIssuedEvent({
        invoiceId: this._id.value,
        clinicId: this._clinicId.value,
        patientId: this._patientId.value,
        appointmentId: this._appointmentId?.value ?? null,
        paymentId: this._paymentId?.value ?? null,
        invoiceNumber: props.invoiceNumber,
        action: LogAction.INVOICE_ISSUED,
        type: LogType.INFO,
        source: props.source,
        actorId: props.actorId,
      })
    );
  }

  /**
   * Entegratör (port) belge sonucunu uygular. e-belge gönderimi muhasebeden bağımsız
   * bir outbound durumdur (doc 07 §5): sonuç REJECTED olsa bile fatura ISSUED'a finalize
   * edilir; einvoiceStatus ayrı izlenir. Noop'ta documentType=INTERNAL, uuid=null gelir.
   */
  public applyEDocumentResult(props: ApplyEDocumentResultProps): void {
    this._documentType = props.documentType;
    this._einvoiceUuid = UUID.create(props.uuid).instance ?? null;
    this._einvoiceStatus = props.status;
    if (props.invoiceNumber) {
      this._invoiceNumber = InvoiceNumber.create(props.invoiceNumber);
    }
    if (this.isPending()) {
      this._status = InvoiceStatusSchema.enum.ISSUED;
      this._issuedAt = this._issuedAt ?? new Date();
    }
  }

  public fail(props: FailInvoiceEntityProps): void {
    this._status = InvoiceStatusSchema.enum.FAILED;
    this.addDomainEvent(
      new InvoiceFailedEvent({
        invoiceId: this._id.value,
        clinicId: this._clinicId.value,
        patientId: this._patientId.value,
        appointmentId: this._appointmentId?.value ?? null,
        paymentId: this._paymentId?.value ?? null,
        reason: props.reason,
        action: LogAction.INVOICE_FAILED,
        type: LogType.ERROR,
        source: props.source,
        actorId: props.actorId,
      })
    );
  }

  public toPersistence(): IInvoice {
    return {
      id: this._id.value,
      clinicId: this._clinicId.value,
      patientId: this._patientId.value,
      appointmentId: this._appointmentId?.value ?? null,
      paymentId: this._paymentId?.value ?? null,

      amount: this._taxSpecification.grossAmount.amount,
      currency: this._taxSpecification.netAmount.currency,
      vatRate: this._taxSpecification.taxRate,
      netTotal: this._taxSpecification.netAmount.amount,
      vatTotal: this._taxSpecification.taxAmount.amount,

      status: this._status,
      invoiceNumber: this._invoiceNumber?.value || null,
      issuedAt: this._issuedAt,
      providerRef: this._providerRef,
      documentType: this._documentType,
      einvoiceUuid: this._einvoiceUuid?.value ?? null,
      einvoiceStatus: this._einvoiceStatus,
      rawResponse: this._rawResponse,
      createdAt: this._createdAt,
      updatedAt: DateTimeManager.create(),
      isDeleted: this._isDeleted,
    };
  }
}

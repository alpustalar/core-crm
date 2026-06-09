import { Invoice as IInvoice, InvoiceStatus, Prisma } from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { InvoiceIssuedEvent } from '../events/invoice-issued.event';
import { InvoiceFailedEvent } from '../events/invoice-failed.event';
import { LogAction, LogSource, LogType } from '@src/domain/constants/log-action.constant';

export interface IssueInvoiceEntityProps {
  invoiceNumber: string;
  providerRef: string;
  issuedAt: Date;
  rawResponse?: unknown;
  source?: LogSource;
  actorId?: string;
}

export interface FailInvoiceEntityProps {
  reason: string;
  source?: LogSource;
  actorId?: string;
}

export class Invoice extends AggregateRoot implements IInvoice {
  constructor(data: IInvoice) {
    super();
    this._id = data.id;
    this._clinicId = data.clinicId;
    this._patientId = data.patientId;
    this._appointmentId = data.appointmentId;
    this._paymentId = data.paymentId;
    this._amount = data.amount;
    this._currency = data.currency;
    this._status = data.status;
    this._invoiceNumber = data.invoiceNumber;
    this._issuedAt = data.issuedAt;
    this._providerRef = data.providerRef;
    this._rawResponse = data.rawResponse;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._isDeleted = data.isDeleted;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _patientId: string;
  get patientId(): string {
    return this._patientId;
  }

  private _appointmentId: string | null;
  get appointmentId(): string | null {
    return this._appointmentId;
  }

  private _paymentId: string | null;
  get paymentId(): string | null {
    return this._paymentId;
  }

  private _amount: Prisma.Decimal;
  get amount(): Prisma.Decimal {
    return this._amount;
  }

  private _currency: string;
  get currency(): string {
    return this._currency;
  }

  private _status: InvoiceStatus;
  get status(): InvoiceStatus {
    return this._status;
  }

  private _invoiceNumber: string | null;
  get invoiceNumber(): string | null {
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

  private _rawResponse: Prisma.JsonValue | null;
  get rawResponse(): Prisma.JsonValue | null {
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

  public isPending(): boolean {
    return this._status === InvoiceStatus.PENDING;
  }

  public isIssued(): boolean {
    return this._status === InvoiceStatus.ISSUED;
  }

  public issue(props: IssueInvoiceEntityProps): void {
    if (!this.isPending()) {
      throw new Error('Yalnızca bekleyen faturalar kesilebilir.');
    }
    this._status = InvoiceStatus.ISSUED;
    this._invoiceNumber = props.invoiceNumber;
    this._providerRef = props.providerRef;
    this._issuedAt = props.issuedAt;
    if (props.rawResponse !== undefined) {
      this._rawResponse = props.rawResponse as Prisma.JsonValue;
    }
    this.addDomainEvent(
      new InvoiceIssuedEvent({
        invoiceId: this._id,
        clinicId: this._clinicId,
        patientId: this._patientId,
        appointmentId: this._appointmentId,
        paymentId: this._paymentId,
        invoiceNumber: props.invoiceNumber,
        action: LogAction.INVOICE_ISSUED,
        type: LogType.INFO,
        source: props.source,
        actorId: props.actorId,
      })
    );
  }

  public fail(props: FailInvoiceEntityProps): void {
    this._status = InvoiceStatus.FAILED;
    this.addDomainEvent(
      new InvoiceFailedEvent({
        invoiceId: this._id,
        clinicId: this._clinicId,
        patientId: this._patientId,
        appointmentId: this._appointmentId,
        paymentId: this._paymentId,
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
      id: this._id,
      clinicId: this._clinicId,
      patientId: this._patientId,
      appointmentId: this._appointmentId,
      paymentId: this._paymentId,
      amount: this._amount,
      currency: this._currency,
      status: this._status,
      invoiceNumber: this._invoiceNumber,
      issuedAt: this._issuedAt,
      providerRef: this._providerRef,
      rawResponse: this._rawResponse,
      createdAt: this._createdAt,
      updatedAt: new Date(),
      isDeleted: this._isDeleted,
    };
  }
}

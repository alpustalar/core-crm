import {
  PosTransaction as IPosTransaction,
  PosTransactionStatus,
  Prisma,
} from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { PosTransactionSucceededEvent } from '../events/pos-transaction-succeeded.event';
import { PosTransactionFailedEvent } from '../events/pos-transaction-failed.event';
import { PosTransactionCancelledEvent } from '../events/pos-transaction-cancelled.event';
import { PosTransactionTimeoutEvent } from '../events/pos-transaction-timeout.event';

/**
 * Fiziksel POS işlemini temsil eden domain entity.
 *
 * Durum geçişleri yalnızca `mark*` metodları üzerinden yapılır; her geçiş
 * PENDING → terminal durum invariant'ını korur ve idempotenttir (terminal
 * bir işlem tekrar işaretlenmeye çalışılırsa sessizce yok sayılır — reconcile
 * ve callback yarışlarına karşı güvenli).
 *
 * NOT: Audit/domain event'leri Faz 3'te eklenecektir (publisher + listener
 * akışıyla). Şimdilik entity yalnızca durum yönetiminden sorumludur.
 */
export class PosTransactionEntity
  extends AggregateRoot
  implements IPosTransaction
{
  constructor(data: IPosTransaction) {
    super();
    this._id = data.id;
    this._posDeviceId = data.posDeviceId;
    this._clinicId = data.clinicId;
    this._patientId = data.patientId;
    this._appointmentId = data.appointmentId;
    this._paymentId = data.paymentId;
    this._amount = data.amount;
    this._currency = data.currency;
    this._status = data.status;
    this._externalRef = data.externalRef;
    this._rawRequest = data.rawRequest;
    this._rawResponse = data.rawResponse;
    this._initiatedAt = data.initiatedAt;
    this._completedAt = data.completedAt;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _posDeviceId: string;
  get posDeviceId(): string {
    return this._posDeviceId;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _patientId: string | null;
  get patientId(): string | null {
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

  private _status: PosTransactionStatus;
  get status(): PosTransactionStatus {
    return this._status;
  }

  private _externalRef: string | null;
  get externalRef(): string | null {
    return this._externalRef;
  }

  private _rawRequest: Prisma.JsonValue | null;
  get rawRequest(): Prisma.JsonValue | null {
    return this._rawRequest;
  }

  private _rawResponse: Prisma.JsonValue | null;
  get rawResponse(): Prisma.JsonValue | null {
    return this._rawResponse;
  }

  private _initiatedAt: Date;
  get initiatedAt(): Date {
    return this._initiatedAt;
  }

  private _completedAt: Date | null;
  get completedAt(): Date | null {
    return this._completedAt;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  public isPending(): boolean {
    return this._status === PosTransactionStatus.PENDING;
  }

  public isSuccess(): boolean {
    return this._status === PosTransactionStatus.SUCCESS;
  }

  /** Terminalin döndürdüğü referansı/ham isteği işler (durum değiştirmez). */
  public setExternalRef(externalRef: string, rawRequest?: unknown): void {
    this._externalRef = externalRef;
    if (rawRequest !== undefined) {
      this._rawRequest = rawRequest as Prisma.JsonValue;
    }
  }

  public markSuccess(externalRef?: string, rawResponse?: unknown): void {
    if (!this.isPending()) return;
    this._status = PosTransactionStatus.SUCCESS;
    if (externalRef) this._externalRef = externalRef;
    if (rawResponse !== undefined) {
      this._rawResponse = rawResponse as Prisma.JsonValue;
    }
    this._completedAt = new Date();
    this.addDomainEvent(
      new PosTransactionSucceededEvent({
        posTransactionId: this._id,
        clinicId: this._clinicId,
        paymentId: this._paymentId,
        externalRef: this._externalRef,
        amount: this._amount,
        currency: this._currency,
      })
    );
  }

  public markFailed(rawResponse?: unknown): void {
    if (!this.isPending()) return;
    this._status = PosTransactionStatus.FAILED;
    if (rawResponse !== undefined) {
      this._rawResponse = rawResponse as Prisma.JsonValue;
    }
    this._completedAt = new Date();
    this.addDomainEvent(
      new PosTransactionFailedEvent({
        posTransactionId: this._id,
        clinicId: this._clinicId,
        paymentId: this._paymentId,
      })
    );
  }

  public markCancelled(rawResponse?: unknown): void {
    if (!this.isPending()) return;
    this._status = PosTransactionStatus.CANCELLED;
    if (rawResponse !== undefined) {
      this._rawResponse = rawResponse as Prisma.JsonValue;
    }
    this._completedAt = new Date();
    this.addDomainEvent(
      new PosTransactionCancelledEvent({
        posTransactionId: this._id,
        clinicId: this._clinicId,
        paymentId: this._paymentId,
      })
    );
  }

  public markTimeout(): void {
    if (!this.isPending()) return;
    this._status = PosTransactionStatus.TIMEOUT;
    this._completedAt = new Date();
    this.addDomainEvent(
      new PosTransactionTimeoutEvent({
        posTransactionId: this._id,
        clinicId: this._clinicId,
      })
    );
  }

  public toPersistence(): IPosTransaction {
    return {
      id: this._id,
      posDeviceId: this._posDeviceId,
      clinicId: this._clinicId,
      patientId: this._patientId,
      appointmentId: this._appointmentId,
      paymentId: this._paymentId,
      amount: this._amount,
      currency: this._currency,
      status: this._status,
      externalRef: this._externalRef,
      rawRequest: this._rawRequest,
      rawResponse: this._rawResponse,
      initiatedAt: this._initiatedAt,
      completedAt: this._completedAt,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}

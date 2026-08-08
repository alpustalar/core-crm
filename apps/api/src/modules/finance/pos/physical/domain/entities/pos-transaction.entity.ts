import { PosTransaction as IPosTransaction } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { PosTransactionSucceededEvent } from '../events/pos-transaction-succeeded.event';
import { PosTransactionFailedEvent } from '../events/pos-transaction-failed.event';
import { PosTransactionCancelledEvent } from '../events/pos-transaction-cancelled.event';
import { PosTransactionTimeoutEvent } from '../events/pos-transaction-timeout.event';
import PosTransactionStatusSchema, {
  PosTransactionStatusType as PosTransactionStatus,
} from '@input-type-schemas/PosTransactionStatusSchema';
import { JsonValueType } from '@input-type-schemas/JsonValueSchema';
import { Money } from '@src/domain/value-objects/money.vo';
import { CreatePosTransactionProps } from '@modules/finance/pos/physical/domain/contracts/pos-physical.contracts';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { FirebaseUid } from '@src/domain/value-objects/firebase-uid.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { Guard } from '@common/domain/guards';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import { shouldValidate } from '@common/domain/utils/should-validate';
import { JsonValue } from '@common/interfaces';
import { isNotUndefined } from '@common/utils/is-not-undefined';

/**
 * Fiziksel POS işlemini temsil eden domain entity.
 *
 * Durum geçişleri yalnızca `mark*` metodları üzerinden yapılır; her geçiş
 * PENDING → terminal durum invariant'ını korur ve idempotenttir (terminal
 * bir işlem tekrar işaretlenmeye çalışılırsa sessizce yok sayılır — reconcile
 * ve callback yarışlarına karşı güvenli).
 *
 */
export class PosTransaction extends AggregateRoot {
  constructor(data: IPosTransaction) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._posDeviceId = data.posDeviceId;
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._patientId = FirebaseUid.create(data.patientId).instance ?? null;
    this._appointmentId = UUID.create(data.appointmentId).instance ?? null;
    this._paymentId = data.paymentId;
    this._amount = Money.fromTrusted(data.amount, data.currency);
    this._status = data.status;
    this._externalRef = data.externalRef;
    this._rawRequest = data.rawRequest;
    this._rawResponse = data.rawResponse;
    this._initiatedAt = data.initiatedAt;
    this._completedAt = data.completedAt;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: UUID;

  get id(): UUID {
    return this._id;
  }

  private _posDeviceId: string;

  get posDeviceId(): string {
    return this._posDeviceId;
  }

  private _clinicId: UUID;

  get clinicId(): UUID {
    return this._clinicId;
  }

  private _patientId: FirebaseUid | null;

  get patientId(): FirebaseUid | null {
    return this._patientId;
  }

  private _appointmentId: UUID | null;

  get appointmentId(): UUID | null {
    return this._appointmentId;
  }

  private _paymentId: string | null;

  get paymentId(): string | null {
    return this._paymentId;
  }

  private _amount: Money;

  get amount(): Money {
    return this._amount;
  }

  private _status: PosTransactionStatus;

  get status(): PosTransactionStatus {
    return this._status;
  }

  private _externalRef: string | null;

  get externalRef(): string | null {
    return this._externalRef;
  }

  private _rawRequest: JsonValueType | null;

  get rawRequest(): JsonValueType | null {
    return this._rawRequest;
  }

  private _rawResponse: JsonValueType | null;

  get rawResponse(): JsonValueType | null {
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

  public get validate() {
    return {
      status: {
        isPending: (error: Error) => this._isPending(error),
        isSuccess: (error: Error) => this._isSuccess(error),
      },
      has: {
        externalRef: (error: Error) => {
          const exRef = this._externalRef;
          return Guard.monitor(
            exRef,
            !!exRef,
            () => error ?? new Error('externalRef mevcut değil')
          );
        },
      },
    };
  }

  public static create(props: CreatePosTransactionProps): PosTransaction {
    const now = DateTimeManager.create();

    const money = Money.create(props.amount, props.currency).orThrow();

    return new PosTransaction({
      id: UUID.createOrGenerate(props.id).value,
      posDeviceId: props.posDeviceId,
      clinicId: UUID.create(props.clinicId).orThrow().value,
      patientId: UUID.create(props.patientId)?.instance?.value ?? null,
      appointmentId: UUID.create(props.appointmentId)?.instance?.value ?? null,
      paymentId: props.paymentId ?? null,
      amount: money.value,
      currency: money.currency,
      status: PosTransactionStatusSchema.enum.PENDING,
      externalRef: props.externalRef ?? null,
      rawRequest: props.rawRequest as JsonValue,
      rawResponse: null,
      initiatedAt: now,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Terminalin döndürdüğü referansı/ham isteği işler (durum değiştirmez). */
  public setExternalRef(externalRef: string, rawRequest?: unknown): void {
    this._externalRef = externalRef;
    if (isNotUndefined(rawRequest)) {
      this._rawRequest = rawRequest as JsonValue;
    }
  }

  public markSuccess(
    externalRef?: string,
    rawResponse?: unknown,
    options = DefaultValidateOptions
  ): void {
    if (shouldValidate(options)) this._isPending().orThrow();

    this._status = PosTransactionStatusSchema.enum.SUCCESS;

    if (externalRef) this._externalRef = externalRef;

    if (isNotUndefined(rawResponse)) {
      this._rawResponse = rawResponse as JsonValue;
    }
    this._completedAt = DateTimeManager.create();

    this.addDomainEvent(
      new PosTransactionSucceededEvent({
        posTransactionId: this._id.value,
        clinicId: this._clinicId.value,
        paymentId: this._paymentId,
        externalRef: this._externalRef,
        amount: this._amount.value,
        currency: this._amount.currency,
      })
    );
  }

  public markFailed(
    rawResponse?: unknown,
    options = DefaultValidateOptions
  ): void {
    if (shouldValidate(options)) this._isPending().orThrow();

    this._status = PosTransactionStatusSchema.enum.FAILED;
    if (isNotUndefined(rawResponse)) {
      this._rawResponse = rawResponse as JsonValue;
    }
    this._completedAt = DateTimeManager.create();
    this.addDomainEvent(
      new PosTransactionFailedEvent({
        posTransactionId: this._id.value,
        clinicId: this._clinicId.value,
        paymentId: this._paymentId,
      })
    );
  }

  public markCancelled(
    rawResponse?: unknown,
    options = DefaultValidateOptions
  ): void {
    if (shouldValidate(options)) this._isPending().orThrow();
    this._status = PosTransactionStatusSchema.enum.CANCELLED;
    if (isNotUndefined(rawResponse)) {
      this._rawResponse = rawResponse as JsonValue;
    }
    this._completedAt = DateTimeManager.create();
    this.addDomainEvent(
      new PosTransactionCancelledEvent({
        posTransactionId: this._id.value,
        clinicId: this._clinicId.value,
        paymentId: this._paymentId,
      })
    );
  }

  public markTimeout(options = DefaultValidateOptions): void {
    if (shouldValidate(options)) this._isPending().orThrow();

    this._status = PosTransactionStatusSchema.enum.TIMEOUT;
    this._completedAt = DateTimeManager.create();
    this.addDomainEvent(
      new PosTransactionTimeoutEvent({
        posTransactionId: this._id.value,
        clinicId: this._clinicId.value,
      })
    );
  }

  public toPersistence(): IPosTransaction {
    return {
      id: this._id.value,
      posDeviceId: this._posDeviceId,
      clinicId: this._clinicId.value,
      patientId: this._patientId?.value ?? null,
      appointmentId: this._appointmentId?.value ?? null,
      paymentId: this._paymentId,
      amount: this._amount.value,
      currency: this._amount.currency,
      status: this._status,
      externalRef: this._externalRef,
      rawRequest: this._rawRequest,
      rawResponse: this._rawResponse,
      initiatedAt: this._initiatedAt,
      completedAt: this._completedAt,
      createdAt: this._createdAt,
      updatedAt: DateTimeManager.create(),
    };
  }

  private _isSuccess(error?: Error): Guard<boolean> {
    const isSuccess = this._status === PosTransactionStatusSchema.enum.SUCCESS;
    return Guard.monitor(
      isSuccess,
      isSuccess,
      () => error ?? new Error('Pos işlemi başarılı değil')
    );
  }

  private _isPending(error?: Error): Guard<boolean> {
    const isPending = this._status === PosTransactionStatusSchema.enum.PENDING;
    return Guard.monitor(
      isPending,
      isPending,
      () => error ?? new Error('Pos işlemi beklemede değil')
    );
  }
}

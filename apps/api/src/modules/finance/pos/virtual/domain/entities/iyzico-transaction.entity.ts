import { IyzicoTransaction as IIyzicoTransaction } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import IyzicoTransactionStatusSchema, {
  IyzicoTransactionStatusType as IyzicoTransactionStatus,
} from '@input-type-schemas/IyzicoTransactionStatusSchema';
import { randomUUID } from 'crypto';
import {
  CreateIyzicoTransactionProps,
  MarkIyzicoFailedInput,
  MarkIyzicoRefundedInput,
  MarkIyzicoSuccessInput,
} from '../iyzico-transaction.contracts';

/**
 * iyzico sanal POS işlemini temsil eden domain entity. Durum geçişleri yalnızca `markAs*`
 * metodları üzerinden yapılır; her geçiş idempotenttir (callback/webhook yarışlarına karşı
 * güvenli): INITIALIZE → SUCCESS/FAILURE, SUCCESS → REFUNDED. Repository yalnızca `save`
 * (upsert) ile entity'nin o anki halini yazar.
 */
export class IyzicoTransaction
  extends AggregateRoot
  implements IIyzicoTransaction
{
  constructor(data: IIyzicoTransaction) {
    super();
    this._id = data.id;
    this._installmentId = data.installmentId;
    this._conversationId = data.conversationId;
    this._token = data.token;
    this._iyzicoPaymentId = data.iyzicoPaymentId;
    this._iyzicoPaymentTransactionId = data.iyzicoPaymentTransactionId;
    this._rawResponse = data.rawResponse;
    this._status = data.status;
    this._errorCode = data.errorCode;
    this._errorMessage = data.errorMessage;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _installmentId: string;
  get installmentId(): string {
    return this._installmentId;
  }

  private _conversationId: string;
  get conversationId(): string {
    return this._conversationId;
  }

  private _token: string | null;
  get token(): string | null {
    return this._token;
  }

  private _iyzicoPaymentId: string | null;
  get iyzicoPaymentId(): string | null {
    return this._iyzicoPaymentId;
  }

  private _iyzicoPaymentTransactionId: string | null;
  get iyzicoPaymentTransactionId(): string | null {
    return this._iyzicoPaymentTransactionId;
  }

  private _rawResponse: IIyzicoTransaction['rawResponse'];
  get rawResponse(): IIyzicoTransaction['rawResponse'] {
    return this._rawResponse;
  }

  private _status: IyzicoTransactionStatus;
  get status(): IyzicoTransactionStatus {
    return this._status;
  }

  private _errorCode: string | null;
  get errorCode(): string | null {
    return this._errorCode;
  }

  private _errorMessage: string | null;
  get errorMessage(): string | null {
    return this._errorMessage;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /** Yeni iyzico işlemi (ödeme formu başlatıldığında) — status INITIALIZE. */
  public static create(props: CreateIyzicoTransactionProps): IyzicoTransaction {
    const now = new Date();
    return new IyzicoTransaction({
      id: props.id ?? randomUUID(),
      installmentId: props.installmentId,
      conversationId: props.conversationId,
      token: props.token ?? null,
      iyzicoPaymentId: null,
      iyzicoPaymentTransactionId: null,
      rawResponse: null,
      status: IyzicoTransactionStatusSchema.enum.INITIALIZE,
      errorCode: null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public isInitialize(): boolean {
    return this._status === IyzicoTransactionStatusSchema.enum.INITIALIZE;
  }

  public isSuccess(): boolean {
    return this._status === IyzicoTransactionStatusSchema.enum.SUCCESS;
  }

  /** Ödeme başarıyla tamamlandı — yalnız INITIALIZE'dan (idempotent: tekrar çağrı yok sayılır). */
  public markAsSuccess(input: MarkIyzicoSuccessInput): void {
    if (!this.isInitialize()) return;
    this._status = IyzicoTransactionStatusSchema.enum.SUCCESS;
    this._iyzicoPaymentId = input.iyzicoPaymentId;
    this._iyzicoPaymentTransactionId =
      input.iyzicoPaymentTransactionId ?? null;
    this._applyRawResponse(input.rawResponse);
  }

  /** Ödeme başarısız — yalnız INITIALIZE'dan (idempotent). */
  public markAsFailed(input: MarkIyzicoFailedInput): void {
    if (!this.isInitialize()) return;
    this._status = IyzicoTransactionStatusSchema.enum.FAILURE;
    this._errorCode = input.errorCode ?? null;
    this._errorMessage = input.errorMessage ?? null;
    this._applyRawResponse(input.rawResponse);
  }

  /** İade — yalnız başarılı (SUCCESS) işlemden (idempotent: tekrar çağrı yok sayılır). */
  public markAsRefunded(input: MarkIyzicoRefundedInput): void {
    if (!this.isSuccess()) return;
    this._status = IyzicoTransactionStatusSchema.enum.REFUNDED;
    this._applyRawResponse(input.rawResponse);
  }

  public toPersistence(): IIyzicoTransaction {
    return {
      id: this._id,
      installmentId: this._installmentId,
      conversationId: this._conversationId,
      token: this._token,
      iyzicoPaymentId: this._iyzicoPaymentId,
      iyzicoPaymentTransactionId: this._iyzicoPaymentTransactionId,
      rawResponse: this._rawResponse,
      status: this._status,
      errorCode: this._errorCode,
      errorMessage: this._errorMessage,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }

  private _applyRawResponse(rawResponse?: unknown): void {
    if (rawResponse !== undefined) {
      this._rawResponse = rawResponse as IIyzicoTransaction['rawResponse'];
    }
  }
}

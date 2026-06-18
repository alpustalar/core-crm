import { BaseEvent } from '@common/interfaces';
import { POS_EVENTS } from '@src/domain/constants/events';
import { Decimal } from 'decimal.js';

export interface PosTransactionSucceededEventPayload {
  posTransactionId: string;
  clinicId: string;
  paymentId: string | null;
  externalRef: string | null;
  amount: Decimal;
  currency: string;
}

export class PosTransactionSucceededEvent extends BaseEvent {
  static readonly NAME = POS_EVENTS.TRANSACTION_SUCCESS;

  public readonly posTransactionId: string;
  public readonly clinicId: string;
  public readonly paymentId: string | null;
  public readonly externalRef: string | null;
  public readonly amount: Decimal;
  public readonly currency: string;

  constructor(payload: PosTransactionSucceededEventPayload) {
    super();
    this.posTransactionId = payload.posTransactionId;
    this.clinicId = payload.clinicId;
    this.paymentId = payload.paymentId;
    this.externalRef = payload.externalRef;
    this.amount = payload.amount;
    this.currency = payload.currency;
  }
}

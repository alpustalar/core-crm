import { BaseEvent } from '@common/interfaces';
import { POS_EVENTS } from '@src/domain/constants/events';

export interface PosTransactionCancelledEventPayload {
  posTransactionId: string;
  clinicId: string;
  paymentId: string | null;
}

export class PosTransactionCancelledEvent extends BaseEvent {
  static readonly NAME = POS_EVENTS.TRANSACTION_CANCELLED;

  public readonly posTransactionId: string;
  public readonly clinicId: string;
  public readonly paymentId: string | null;

  constructor(payload: PosTransactionCancelledEventPayload) {
    super();
    this.posTransactionId = payload.posTransactionId;
    this.clinicId = payload.clinicId;
    this.paymentId = payload.paymentId;
  }
}

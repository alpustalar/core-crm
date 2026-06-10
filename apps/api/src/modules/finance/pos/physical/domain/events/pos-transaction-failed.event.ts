import { BaseEvent } from '@common/interfaces';
import { POS_EVENTS } from '@src/domain/constants/events';

export interface PosTransactionFailedEventPayload {
  posTransactionId: string;
  clinicId: string;
  paymentId: string | null;
}

export class PosTransactionFailedEvent extends BaseEvent {
  static readonly NAME = POS_EVENTS.TRANSACTION_FAILED;

  public readonly posTransactionId: string;
  public readonly clinicId: string;
  public readonly paymentId: string | null;

  constructor(payload: PosTransactionFailedEventPayload) {
    super();
    this.posTransactionId = payload.posTransactionId;
    this.clinicId = payload.clinicId;
    this.paymentId = payload.paymentId;
  }
}

import { BaseEvent } from '@common/interfaces';
import { POS_EVENTS } from '@src/domain/constants/events';

export interface PosTransactionTimeoutEventPayload {
  posTransactionId: string;
  clinicId: string;
}

export class PosTransactionTimeoutEvent extends BaseEvent {
  static readonly NAME = POS_EVENTS.TRANSACTION_TIMEOUT;

  public readonly posTransactionId: string;
  public readonly clinicId: string;

  constructor(payload: PosTransactionTimeoutEventPayload) {
    super();
    this.posTransactionId = payload.posTransactionId;
    this.clinicId = payload.clinicId;
  }
}

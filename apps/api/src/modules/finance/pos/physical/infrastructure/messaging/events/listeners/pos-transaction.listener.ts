import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { POS_EVENTS } from '@src/domain/constants/events';
import { PosTransactionSucceededEvent } from '@modules/finance/pos/physical/domain/events/pos-transaction-succeeded.event';
import { PosTransactionFailedEvent } from '@modules/finance/pos/physical/domain/events/pos-transaction-failed.event';
import { PosTransactionCancelledEvent } from '@modules/finance/pos/physical/domain/events/pos-transaction-cancelled.event';
import { PosTransactionTimeoutEvent } from '@modules/finance/pos/physical/domain/events/pos-transaction-timeout.event';

@Injectable()
export class PosTransactionListener {
  private readonly logger = new Logger(PosTransactionListener.name);

  @OnEvent(POS_EVENTS.TRANSACTION_SUCCESS, { async: true })
  handleSuccess(event: PosTransactionSucceededEvent): void {
    this.logger.log(
      `POS işlem başarılı: id=${event.posTransactionId} clinicId=${event.clinicId} amount=${event.amount} ${event.currency} externalRef=${event.externalRef}`
    );
  }

  @OnEvent(POS_EVENTS.TRANSACTION_FAILED, { async: true })
  handleFailed(event: PosTransactionFailedEvent): void {
    this.logger.warn(
      `POS işlem başarısız: id=${event.posTransactionId} clinicId=${event.clinicId}`
    );
  }

  @OnEvent(POS_EVENTS.TRANSACTION_CANCELLED, { async: true })
  handleCancelled(event: PosTransactionCancelledEvent): void {
    this.logger.warn(
      `POS işlem iptal edildi: id=${event.posTransactionId} clinicId=${event.clinicId}`
    );
  }

  @OnEvent(POS_EVENTS.TRANSACTION_TIMEOUT, { async: true })
  handleTimeout(event: PosTransactionTimeoutEvent): void {
    this.logger.warn(
      `POS işlem zaman aşımı: id=${event.posTransactionId} clinicId=${event.clinicId}`
    );
  }
}

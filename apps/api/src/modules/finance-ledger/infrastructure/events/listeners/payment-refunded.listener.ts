import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PAYMENT_EVENTS } from '@src/domain/constants/events';
import { PaymentRefundedEvent } from '@modules/payment/domain/events/payment-refunded.event';
import { RefundLedgerEntriesUseCase } from '@modules/finance-ledger/application/use-cases/commands';

@Injectable()
export class PaymentRefundedListener {
  private readonly logger = new Logger(PaymentRefundedListener.name);

  constructor(
    private readonly refundLedgerEntries: RefundLedgerEntriesUseCase
  ) {}

  @OnEvent(PAYMENT_EVENTS.REFUNDED, { async: true })
  async handlePaymentRefunded(event: PaymentRefundedEvent): Promise<void> {
    this.logger.log(`İade eventi yakalandı: ${event.paymentId}`);

    try {
      await this.refundLedgerEntries.execute(event.paymentId);
      this.logger.log(`Ledger kayıtları iade edildi: ${event.paymentId}`);
    } catch (error) {
      this.logger.error(
        `Ledger iade işlemi başarısız: ${event.paymentId}`,
        error
      );
    }
  }
}

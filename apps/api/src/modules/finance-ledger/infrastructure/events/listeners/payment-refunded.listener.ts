import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PAYMENT_EVENTS } from '@src/domain/constants/events';
import { PaymentRefundedEvent } from '@modules/payment/domain/events/payment-refunded.event';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { RefundLedgerEntriesCommand } from '@modules/finance-ledger/application/commands/refund-ledger-entries/refund-ledger-entries.command';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';

@Injectable()
export class PaymentRefundedListener {
  private readonly logger = new Logger(PaymentRefundedListener.name);

  constructor(private readonly commandBus: TSCommandBus) {}

  @OnEvent(PAYMENT_EVENTS.REFUNDED, { async: true })
  async handlePaymentRefunded(event: PaymentRefundedEvent): Promise<void> {
    this.logger.log(`İade eventi yakalandı: ${event.paymentId}`);

    try {
      await this.commandBus.execute(
        new RefundLedgerEntriesCommand(
          event.paymentId,
          ExecutionContextFactory.createInternal()
        )
      );
      this.logger.log(`Ledger kayıtları iade edildi: ${event.paymentId}`);
    } catch (error) {
      this.logger.error(
        `Ledger iade işlemi başarısız: ${event.paymentId}`,
        error
      );
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PAYMENT_EVENTS } from '@src/domain/constants/events';
import { PaymentRefundedEvent } from '@modules/finance/payment/domain/events/payment-refunded.event';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { RefundLedgerEntriesCommand } from '@modules/finance/finance-ledger/application/commands/refund-ledger-entries/refund-ledger-entries.command';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { CriticalFailurePublisher } from '@common/observability/critical-failure.publisher';

@Injectable()
export class PaymentRefundedListener {
  private readonly logger = new Logger(PaymentRefundedListener.name);

  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly criticalFailure: CriticalFailurePublisher
  ) {}

  @OnEvent(PAYMENT_EVENTS.REFUNDED, { async: true })
  async handlePaymentRefunded(event: PaymentRefundedEvent): Promise<void> {
    this.logger.log(`İade eventi yakalandı: taksit=${event.installmentId}`);

    try {
      await this.commandBus.execute(
        new RefundLedgerEntriesCommand(
          event.installmentId,
          ExecutionContextFactory.createInternal()
        )
      );
      this.logger.log(`Cari kayıt iade edildi: taksit=${event.installmentId}`);
    } catch (error) {
      this.logger.error(
        `Cari iade işlemi başarısız: taksit=${event.installmentId}`,
        error
      );
      // İade fiilen yapıldı (para geri gitti) ama cari kayıt hâlâ tahsilat
      // görünüyor: gelir olduğundan fazla raporlanır.
      this.criticalFailure.publish({
        operation: 'finance.ledger.refund',
        severity: 'CRITICAL',
        summary: 'İade yapıldı ancak cari kayıt iade olarak işaretlenemedi.',
        errorMessage: error instanceof Error ? error.message : String(error),
        context: {
          installmentId: event.installmentId,
          paymentId: event.paymentId,
        },
        clinicId: event.clinicId,
        dedupeKey: `ledger-refund-failed:${event.installmentId}`,
      });
    }
  }
}

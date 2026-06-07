import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PAYMENT_EVENTS } from '@src/domain/constants/events';
import { PaymentPaidEvent } from '@modules/finance/pos/virtual/domain/events/payment-paid.event';
import { IssueInvoiceCommand } from '@modules/finance/invoice/application/commands/issue-invoice/issue-invoice.command';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

@Injectable()
export class PaymentPaidInvoiceListener {
  private readonly logger = new Logger(PaymentPaidInvoiceListener.name);

  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @OnEvent(PAYMENT_EVENTS.PAID, { async: true })
  async handle(event: PaymentPaidEvent): Promise<void> {
    try {
      // TODO: patientId ve amount, ilgili QueryBus sorguları ile çözülecek.
      // Entegratör seçildiğinde GetPaymentDetailsQuery dispatch edilmeli.
      await this.commandBus.execute(
        new IssueInvoiceCommand({
          clinicId: event.clinicId,
          patientId: '', // TODO: QueryBus üzerinden Payment'tan çekilecek
          appointmentId: event.appointmentId,
          paymentId: event.paymentId,
          amount: 0, // TODO: QueryBus üzerinden Payment.totalAmount çekilecek
          trigger: 'PAYMENT',
          action: LogAction.INVOICE_ISSUED,
          type: LogType.INFO,
          source: LogSource.SYSTEM,
        })
      );
    } catch (error) {
      this.logger.error(
        `Ödeme sonrası fatura kesilemedi: paymentId=${event.paymentId}`,
        error
      );
    }
  }
}

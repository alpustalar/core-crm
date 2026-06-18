import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PAYMENT_EVENTS } from '@src/domain/constants/events';
import { PaymentPaidEvent } from '@modules/finance/payment/domain/events/payment-paid.event';
import { IssueInvoiceCommand } from '@modules/finance/invoice/application/commands/issue-invoice/issue-invoice.command';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetPaymentWithInstallmentsQuery } from '@modules/finance/payment/application/queries/get-payment-with-installments/get-payment-with-installments.query';
import { InvoiceTriggers } from '@modules/finance/invoice/domain/constants/invoice-triggers';
import { Money } from '@src/domain/value-objects/money.vo';

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
      // Cari + tutar payment modülünden çözülür (bounded context — QueryBus).
      const payment = await this.queryBus.execute(
        new GetPaymentWithInstallmentsQuery(event.paymentId)
      );
      if (!payment) {
        this.logger.warn(
          `Fatura için ödeme bulunamadı: paymentId=${event.paymentId}`
        );
        return;
      }

      // Tahsil edilen taksitin tutarı faturalanır; bulunamazsa ödeme toplamı.
      const installment = payment.installments.find(
        (i) => i.id === event.installmentId
      );
      const amount = installment
        ? installment.amount.toNumber()
        : payment.totalAmount.amount.toNumber();

      const currency = installment
        ? installment.currency
        : payment.totalAmount.currency;

      await this.commandBus.execute(
        new IssueInvoiceCommand({
          clinicId: event.clinicId,
          patientId: payment.patientId,
          appointmentId: event.appointmentId,
          paymentId: event.paymentId,
          totalAmount: Money.create(amount, currency),
          trigger: InvoiceTriggers.PAYMENT,
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

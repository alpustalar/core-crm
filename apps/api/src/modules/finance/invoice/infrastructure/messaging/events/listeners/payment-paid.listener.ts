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
import { CriticalFailurePublisher } from '@common/observability/critical-failure.publisher';

@Injectable()
export class PaymentPaidInvoiceListener {
  private readonly logger = new Logger(PaymentPaidInvoiceListener.name);

  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus,
    private readonly criticalFailure: CriticalFailurePublisher
  ) {}

  @OnEvent(PAYMENT_EVENTS.PAID, { async: true })
  async handle(event: PaymentPaidEvent): Promise<void> {
    try {
      // Cari + tutar payment modülünden çözülür (bounded context — QueryBus).
      const { data: payment } = await this.queryBus.execute(
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
        : payment.totalAmount.toNumber();

      const currency = installment ? installment.currency : payment.currency;

      await this.commandBus.execute(
        new IssueInvoiceCommand({
          clinicId: event.clinicId,
          patientId: payment.patientId,
          appointmentId: event.appointmentId,
          paymentId: event.paymentId,
          totalAmount: Money.create(amount, currency).orThrow(),
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
      // Tahsilat yapıldı ama faturası kesilmedi — yasal belge eksiği.
      this.criticalFailure.publish({
        operation: 'finance.invoice.issue-on-payment-paid',
        severity: 'CRITICAL',
        summary: 'Tahsilat alındı ancak faturası kesilemedi.',
        errorMessage: error instanceof Error ? error.message : String(error),
        context: {
          paymentId: event.paymentId,
          installmentId: event.installmentId,
        },
        clinicId: event.clinicId,
        dedupeKey: `invoice-failed:payment:${event.paymentId}`,
      });
    }
  }
}

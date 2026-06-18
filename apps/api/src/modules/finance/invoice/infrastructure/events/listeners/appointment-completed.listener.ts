import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { AppointmentCompletedEvent } from '@modules/clinical/appointment/domain/events/complete-appointment.event';
import { IssueInvoiceCommand } from '@modules/finance/invoice/application/commands/issue-invoice/issue-invoice.command';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetPaymentByAppointmentIdQuery } from '@modules/finance/payment/application/queries/get-payment-by-appointment-id/get-payment-by-appointment-id.query';
import { InvoiceTriggers } from '@modules/finance/invoice/domain/constants/invoice-triggers';

@Injectable()
export class AppointmentCompletedInvoiceListener {
  private readonly logger = new Logger(
    AppointmentCompletedInvoiceListener.name
  );

  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @OnEvent(APPOINTMENT_EVENTS.COMPLETED, { async: true })
  async handle(event: AppointmentCompletedEvent): Promise<void> {
    if (!event.patientId || !event.appointmentId) return;

    try {
      // Tutar, randevuya bağlı ödemeden çözülür (bounded context — QueryBus).
      const payment = await this.queryBus.execute(
        new GetPaymentByAppointmentIdQuery(event.appointmentId)
      );
      // Ödeme yoksa faturalanacak tutar yok → atla (sıfır tutarlı fatura kesilmez).
      if (!payment) return;

      await this.commandBus.execute(
        new IssueInvoiceCommand({
          clinicId: event.clinicId,
          patientId: event.patientId,
          appointmentId: event.appointmentId,
          paymentId: payment.id,
          totalAmount: payment.totalAmount,
          trigger: InvoiceTriggers.APPOINTMENT,
          action: LogAction.INVOICE_ISSUED,
          type: LogType.INFO,
          source: LogSource.SYSTEM,
        })
      );
    } catch (error) {
      this.logger.error(
        `Randevu tamamlanması sonrası fatura kesilemedi: appointmentId=${event.appointmentId}`,
        error
      );
    }
  }
}

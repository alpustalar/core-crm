import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { AppointmentCompletedEvent } from '@modules/appointment/domain/events/complete-appointment.event';
import { IssueInvoiceCommand } from '@modules/invoice/application/commands/issue-invoice/issue-invoice.command';
import { LogAction, LogSource, LogType } from '@src/domain/constants/log-action.constant';

@Injectable()
export class AppointmentCompletedInvoiceListener {
  private readonly logger = new Logger(AppointmentCompletedInvoiceListener.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @OnEvent(APPOINTMENT_EVENTS.COMPLETED, { async: true })
  async handle(event: AppointmentCompletedEvent): Promise<void> {
    if (!event.patientId) return;

    try {
      // TODO: amount, ilgili QueryBus sorgusu ile çözülecek.
      // Entegratör seçildiğinde GetAppointmentPaymentQuery dispatch edilmeli.
      await this.commandBus.execute(
        new IssueInvoiceCommand({
          clinicId: event.clinicId,
          patientId: event.patientId,
          appointmentId: event.appointmentId,
          paymentId: null,
          amount: 0, // TODO: QueryBus üzerinden randevuya ait ödeme tutarı çekilecek
          trigger: 'APPOINTMENT',
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

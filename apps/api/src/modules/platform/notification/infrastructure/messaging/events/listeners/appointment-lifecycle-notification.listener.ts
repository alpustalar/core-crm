import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { AppointmentConfirmedEvent } from '@modules/clinical/appointment/domain/events/confirm-appointment.event';
import { AppointmentCancelledEvent } from '@modules/clinical/appointment/domain/events/cancelled-appointment.event';
import { AppointmentRescheduledEvent } from '@modules/clinical/appointment/domain/events/reschedule-appointment.event';
import { NotificationDispatcherService } from '@modules/platform/notification/application/services/notification-dispatcher.service';

/**
 * Randevu yaşam-döngüsü değişimlerinde (onay/iptal/erteleme) bildirim dağıtır:
 * personel panel-içi + hasta dış kanal. Cross-module event aboneliği. Hata ana
 * akışı bozmaz, yalnız loglanır.
 */
@Injectable()
export class AppointmentLifecycleNotificationListener {
  private readonly logger = new Logger(
    AppointmentLifecycleNotificationListener.name
  );

  constructor(private readonly dispatcher: NotificationDispatcherService) {}

  @OnEvent(APPOINTMENT_EVENTS.CONFIRMED, { async: true })
  async handleConfirmed(event: AppointmentConfirmedEvent): Promise<void> {
    try {
      await this.dispatcher.notifyAppointmentConfirmed({
        appointmentId: event.appointmentId,
        clinicId: event.clinicId,
        patientId: event.patientId,
        patientName: event.patientName,
        patientPhone: event.patientPhone,
        patientEmail: event.patientEmail,
        startTime: event.startTime,
      });
    } catch (error) {
      this.logger.error(
        `Onay bildirimi işlenemedi (appointmentId=${event.appointmentId}): ${error}`
      );
    }
  }

  @OnEvent(APPOINTMENT_EVENTS.CANCELLED, { async: true })
  async handleCancelled(event: AppointmentCancelledEvent): Promise<void> {
    try {
      await this.dispatcher.notifyAppointmentCancelled({
        appointmentId: event.appointmentId,
        clinicId: event.clinicId,
        patientId: event.patientId,
        patientName: event.patientName,
        patientPhone: event.patientPhone,
        patientEmail: event.patientEmail,
        startTime: event.startTime,
        canceledBy: event.canceledBy,
        reason: event.cancelReason,
      });
    } catch (error) {
      this.logger.error(
        `İptal bildirimi işlenemedi (appointmentId=${event.appointmentId}): ${error}`
      );
    }
  }

  @OnEvent(APPOINTMENT_EVENTS.RESCHEDULED, { async: true })
  async handleRescheduled(event: AppointmentRescheduledEvent): Promise<void> {
    try {
      await this.dispatcher.notifyAppointmentRescheduled({
        appointmentId: event.appointmentId,
        clinicId: event.clinicId,
        patientId: event.patientId,
        patientName: event.patientName,
        patientPhone: event.patientPhone,
        patientEmail: event.patientEmail,
        startTime: event.startTime,
      });
    } catch (error) {
      this.logger.error(
        `Erteleme bildirimi işlenemedi (appointmentId=${event.appointmentId}): ${error}`
      );
    }
  }
}

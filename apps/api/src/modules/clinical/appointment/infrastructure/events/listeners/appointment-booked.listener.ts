import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events';
import { AppointmentBookedEvent } from '@modules/clinical/appointment/domain/events/book-appointment.event';

/**
 * Randevu oluşturulmasının (hasta portalı / online) yan etkilerini işler
 * (AppointmentBookedEvent).
 *
 * Randevu `PENDING` statüsünde açılır: klinik onayı bekler. Bu listener,
 * event in-memory yayınlandıktan sonra tetiklenir ({@link TransactionManager.run}).
 */
@Injectable()
export class AppointmentBookedListener {
  private readonly logger = new Logger(AppointmentBookedListener.name);

  @OnEvent(APPOINTMENT_EVENTS.BOOKED, { async: true })
  async handle(event: AppointmentBookedEvent): Promise<void> {
    this.logger.log(
      `Randevu oluşturuldu (onay bekliyor): appointmentId=${event.appointmentId}, ` +
        `clinicId=${event.clinicId}, providerId=${event.providerId}, patientId=${event.patientId}`
    );

    // ── ENTEGRASYON NOKTASI (SEAM) — Audit log ─────────────────────────────
    // Randevu oluşturma güvenlik/iş denetimi için AuditLogService ile loglanacak.
    // CLAUDE.md 3-adım audit akışı: event → publisher → listener → AuditLogService.

    // NOT: Hasta + personel bildirimleri artık platform/notification modülündeki
    // AppointmentBookedNotificationListener tarafından (aynı event'e abone olarak)
    // işlenir. Bu listener yalnız appointment-yerel yan etkiler (audit) içindir.
  }
}

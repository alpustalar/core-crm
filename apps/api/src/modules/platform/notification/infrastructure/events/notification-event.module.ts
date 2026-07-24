import { Module } from '@nestjs/common';
import { StaffNotificationRepositoryModule } from '@modules/platform/notification/infrastructure/persistence/prisma/repositories/staff-notification/staff-notification.repository.module';
import { NotificationDispatcherService } from '@modules/platform/notification/application/services/notification-dispatcher.service';
import { MailPatientNotificationAdapter } from '@modules/platform/notification/infrastructure/delivery/mail-patient-notification.adapter';
import { PATIENT_NOTIFICATION_PORT } from '@modules/platform/notification/domain/ports/patient-notification.port';
import { AppointmentBookedNotificationListener } from '@modules/platform/notification/infrastructure/events/listeners/appointment-booked-notification.listener';
import { AppointmentLifecycleNotificationListener } from '@modules/platform/notification/infrastructure/events/listeners/appointment-lifecycle-notification.listener';
import { AppointmentReminderNotificationListener } from '@modules/platform/notification/infrastructure/events/listeners/appointment-reminder-notification.listener';
import { NotificationRealtimeModule } from '@modules/platform/notification/infrastructure/realtime/notification-realtime.module';
import { MailModule } from '@src/infrastructure/mail/mail.module';

/**
 * Bildirim yan etkilerini bağlar: domain event dinleyicileri (seam) + merkezi
 * dispatcher + hasta teslim adaptörü (WhatsApp template / e-posta portu).
 */
@Module({
  imports: [
    StaffNotificationRepositoryModule,
    MailModule,
    NotificationRealtimeModule,
  ],
  providers: [
    AppointmentBookedNotificationListener,
    AppointmentLifecycleNotificationListener,
    AppointmentReminderNotificationListener,
    NotificationDispatcherService,
    {
      provide: PATIENT_NOTIFICATION_PORT,
      useClass: MailPatientNotificationAdapter,
    },
  ],
})
export class NotificationEventModule {}

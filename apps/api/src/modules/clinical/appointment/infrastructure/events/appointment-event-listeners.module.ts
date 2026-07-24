import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';
import { AppointmentBookedListener } from '@modules/clinical/appointment/infrastructure/events/listeners/appointment-booked.listener';
import { AppointmentCancelledListener } from '@modules/clinical/appointment/infrastructure/events/listeners/appointment-cancelled.listener';
import { AppointmentCompletedListener } from '@modules/clinical/appointment/infrastructure/events/listeners/appointment-completed.listener';
import { AppointmentsBulkSoftDeletedListener } from '@modules/clinical/appointment/infrastructure/events/listeners/appointments-bulk-soft-deleted.listener';
import { AppointmentsBulkCancelledListener } from '@modules/clinical/appointment/infrastructure/events/listeners/appointments-bulk-cancelled.listener';
import { AppointmentNotificationProcessor } from '@modules/clinical/appointment/infrastructure/queue/processors/appointment-notification.processor';
import { AppointmentReminderSchedulerProducer } from '@modules/clinical/appointment/infrastructure/queue/producers/appointment-reminder-scheduler.producer';

/**
 * Randevu domain event'lerinin yan etkilerini bağlar: iptal/tamamlanma
 * listener'ları (seam'ler) + toplu silme bildirim kuyruğu (queue + processor) +
 * periyodik hatırlatma tarama zamanlayıcısı (producer).
 */
@Module({
  imports: [BullModule.registerQueue({ name: QUEUES.APPOINTMENT })],
  providers: [
    AppointmentBookedListener,
    AppointmentCancelledListener,
    AppointmentCompletedListener,
    AppointmentsBulkSoftDeletedListener,
    AppointmentsBulkCancelledListener,
    AppointmentNotificationProcessor,
    AppointmentReminderSchedulerProducer,
  ],
})
export class AppointmentEventListenersModule {}

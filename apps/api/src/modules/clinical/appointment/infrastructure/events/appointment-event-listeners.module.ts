import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';
import { AppointmentCancelledListener } from '@modules/clinical/appointment/infrastructure/events/listeners/appointment-cancelled.listener';
import { AppointmentCompletedListener } from '@modules/clinical/appointment/infrastructure/events/listeners/appointment-completed.listener';
import { AppointmentsBulkSoftDeletedListener } from '@modules/clinical/appointment/infrastructure/events/listeners/appointments-bulk-soft-deleted.listener';
import { AppointmentNotificationProcessor } from '@modules/clinical/appointment/infrastructure/queue/processors/appointment-notification.processor';

/**
 * Randevu domain event'lerinin yan etkilerini bağlar: iptal/tamamlanma
 * listener'ları (seam'ler) + toplu silme bildirim kuyruğu (queue + processor).
 */
@Module({
  imports: [BullModule.registerQueue({ name: QUEUES.APPOINTMENT })],
  providers: [
    AppointmentCancelledListener,
    AppointmentCompletedListener,
    AppointmentsBulkSoftDeletedListener,
    AppointmentNotificationProcessor,
  ],
})
export class AppointmentEventListenersModule {}

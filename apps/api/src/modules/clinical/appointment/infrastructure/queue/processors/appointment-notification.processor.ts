import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { APPOINTMENT_JOBS, QUEUES } from '@common/constants';
import { AppointmentBulkScope } from '@modules/clinical/appointment/domain/events/appointments-bulk-soft-deleted.event';

interface NotifyBulkSoftDeletedJobData {
  scope: AppointmentBulkScope;
  clinicId?: string;
  organizationId?: string;
  affectedCount: number;
}

/**
 * Toplu randevu silme sonrası asenkron yan etkileri yürütür: ilgili hastalara
 * bildirim (mail/mesaj) + ilgili Redis anahtarlarının temizliği.
 */
@Processor(QUEUES.APPOINTMENT)
export class AppointmentNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(AppointmentNotificationProcessor.name);

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case APPOINTMENT_JOBS.NOTIFY_BULK_SOFT_DELETED:
        await this.handleBulkSoftDeleted(
          job.data as NotifyBulkSoftDeletedJobData
        );
        break;
      default:
        this.logger.warn(`Tanımlanmamış Appointment job: ${job.name}`);
    }
  }

  private async handleBulkSoftDeleted(
    data: NotifyBulkSoftDeletedJobData
  ): Promise<void> {
    const scopeKey =
      data.scope === 'CLINIC'
        ? `clinicId=${data.clinicId}`
        : `organizationId=${data.organizationId}`;

    this.logger.log(
      `Toplu randevu silme işleniyor: ${scopeKey}, affectedCount=${data.affectedCount}`
    );

    // ── ENTEGRASYON NOKTASI (SEAM) — Hasta bildirimleri ────────────────────
    // Silinen randevuların hastaları scope'a göre (clinicId/organizationId)
    // sayfalı okunup her birine iptal bildirimi (mail/mesaj) gönderilecek.
    // Bildirim altyapısı bağlandığında bu seam doldurulur.

    // ── ENTEGRASYON NOKTASI (SEAM) — Redis temizliği ───────────────────────
    // Bu randevulara ait cache/slot anahtarları (ör. provider müsaitlik cache'i)
    // varsa burada invalidate edilecek.
  }
}

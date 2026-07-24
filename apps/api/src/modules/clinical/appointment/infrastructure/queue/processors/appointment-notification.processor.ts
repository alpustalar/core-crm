import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { APPOINTMENT_JOBS, QUEUES } from '@common/constants';
import { AppointmentEventBulkScope } from '@modules/clinical/appointment/domain/events/appointments-bulk-soft-deleted.event';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { ProcessAppointmentRemindersCommand } from '@modules/clinical/appointment/application/commands/process-appointment-reminders/process-appointment-reminders.command';

interface NotifyBulkSoftDeletedJobData {
  scope: AppointmentEventBulkScope;
  clinicId?: string;
  organizationId?: string;
  affectedCount: number;
}

/**
 * Randevu kuyruğu işleri: toplu silme sonrası yan etkiler (bildirim + Redis
 * temizliği) ve periyodik hatırlatma taraması (SCAN_DUE_REMINDERS → command).
 */
@Processor(QUEUES.APPOINTMENT)
export class AppointmentNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(AppointmentNotificationProcessor.name);

  constructor(private readonly commandBus: TSCommandBus) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case APPOINTMENT_JOBS.NOTIFY_BULK_SOFT_DELETED:
        await this.handleBulkSoftDeleted(
          job.data as NotifyBulkSoftDeletedJobData
        );
        break;
      case APPOINTMENT_JOBS.SCAN_DUE_REMINDERS:
        await this.commandBus.execute(new ProcessAppointmentRemindersCommand());
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

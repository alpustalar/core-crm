import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ProcessAppointmentRemindersCommand } from './process-appointment-reminders.command';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetClinicAppointmentSettingsQuery } from '@modules/organization/clinic/application/queries/get-clinic-appointment-settings/get-clinic-appointment-settings.query';
import { ClinicAppointmentSettingsView } from '@modules/organization/clinic/application/queries/get-clinic-appointment-settings/get-clinic-appointment-settings.response';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { DateTimeManager } from '@common/utils';
import { APPOINTMENT_REMINDER_MAX_WINDOW_HOURS } from '@common/constants';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment';

/** Tek taramada işlenecek azami randevu (parti boyutu). */
const REMINDER_SCAN_BATCH_LIMIT = 500;

/**
 * Zamanlanmış hatırlatma motoru. Geniş pencerede CONFIRMED + reminderSentAt=null
 * randevuları çeker, her birini kendi kliniğinin `sendSmsReminderHours` penceresine
 * göre eler; penceredeyse entity.markReminderSent() ile işaretleyip kaydeder
 * (reminderSentAt dedup) ve dış-kanal hatırlatma event'ini fırlatır.
 */
@CommandHandler(ProcessAppointmentRemindersCommand)
export class ProcessAppointmentRemindersHandler implements ICommandHandler<
  ProcessAppointmentRemindersCommand,
  void
> {
  private readonly logger = new Logger(ProcessAppointmentRemindersHandler.name);

  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentRepo: IAppointmentCommandRepository,
    private readonly queryBus: TSQueryBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(): Promise<void> {
    const now = DateTimeManager.create();
    const windowEnd = DateTimeManager.addHours(
      now,
      APPOINTMENT_REMINDER_MAX_WINDOW_HOURS
    );

    // Sonuç mutasyona (markReminderSent + save) besleniyor → command repo (CQRS).
    const due = await this.appointmentRepo.findDueForReminder({
      now,
      windowEnd,
      limit: REMINDER_SCAN_BATCH_LIMIT,
    });

    if (due.length === 0) return;

    // Aynı klinik ayarını parti içinde tekrar sorgulamamak için bellekte tutulur
    // (query zaten Redis-cache'li; bu ekstra kalkanı in-loop bus dispatch'i eler).
    const settingsCache = new Map<string, ClinicAppointmentSettingsView>();
    let sent = 0;

    for (const appointment of due) {
      const settings = await this.resolveSettings(
        appointment.clinicId.value,
        settingsCache
      );

      // Hatırlatma kapalı (0) → atla.
      if (settings.sendSmsReminderHours <= 0) continue;

      // Randevu, hatırlatma penceresine girdi mi? (startTime <= now + pencere)
      const reminderThreshold = DateTimeManager.addHours(
        now,
        settings.sendSmsReminderHours
      );
      if (DateTimeManager.isAfter(appointment.startTime, reminderThreshold)) {
        continue;
      }

      await this.dispatchReminder(
        appointment,
        settings.requireReminderResponse
      );
      sent += 1;
    }

    if (sent > 0) {
      this.logger.log(`Randevu hatırlatması: ${sent}/${due.length} gönderildi`);
    }
  }

  /** Klinik ayarını bellekten ya da (yoksa) Redis-cache'li query'den çözer. */
  private async resolveSettings(
    clinicId: string,
    cache: Map<string, ClinicAppointmentSettingsView>
  ): Promise<ClinicAppointmentSettingsView> {
    const cached = cache.get(clinicId);
    if (cached) return cached;

    const { data } = await this.queryBus.execute(
      new GetClinicAppointmentSettingsQuery(clinicId)
    );
    cache.set(clinicId, data);
    return data;
  }

  /**
   * Tek randevuyu işaretler + event fırlatır. Her randevu ayrı transaction —
   * biri hata verirse diğerleri etkilenmez (yalnız loglanır). Kritik olmayan
   * yan etki (bildirim) → run().
   */
  private async dispatchReminder(
    appointment: Appointment,
    requireResponse: boolean
  ): Promise<void> {
    appointment.markReminderSent(requireResponse);
    await this.txManager
      .run(() => this.appointmentRepo.update(appointment))
      .catch((err) =>
        this.logger.error(
          `Hatırlatma gönderilemedi (appointmentId=${appointment.id.value}): ${err}`
        )
      );
  }
}

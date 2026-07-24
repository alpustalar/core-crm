import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { APPOINTMENT_JOBS, QUEUES } from '@common/constants';

/**
 * Randevu hatırlatma taramasını BullMQ repeatable job olarak zamanlar. Her 15
 * dakikada bir çalışır; işi {@link AppointmentNotificationProcessor} alıp
 * ProcessAppointmentRemindersCommand'e çevirir (klinik-başına saat penceresi orada).
 */
@Injectable()
export class AppointmentReminderSchedulerProducer implements OnModuleInit {
  private readonly logger = new Logger(
    AppointmentReminderSchedulerProducer.name
  );

  constructor(
    @InjectQueue(QUEUES.APPOINTMENT) private readonly queue: Queue
  ) {}

  async onModuleInit(): Promise<void> {
    await this.queue.add(
      APPOINTMENT_JOBS.SCAN_DUE_REMINDERS,
      {},
      {
        repeat: { pattern: '*/15 * * * *' }, // her 15 dakikada bir
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
    this.logger.log('Randevu hatırlatma taraması zamanlandı (her 15 dk)');
  }
}

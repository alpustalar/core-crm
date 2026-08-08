import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES, SUBSCRIPTION_JOBS } from '@common/constants';

/**
 * Abonelik periyodik işlerini (yenileme + süre bitirme) BullMQ repeatable job olarak
 * zamanlar. Günlük çalışır; işleri SubscriptionSchedulerProcessor işler.
 */
@Injectable()
export class SubscriptionSchedulerProducer implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionSchedulerProducer.name);

  constructor(
    @InjectQueue(QUEUES.SUBSCRIPTION) private readonly queue: Queue
  ) {}

  async onModuleInit(): Promise<void> {
    // TZ verilmezse BullMQ UTC çalışır → 00:00 TRT için tz zorunlu.
    await this.queue.add(
      SUBSCRIPTION_JOBS.RENEW_DUE,
      {},
      {
        repeat: { pattern: '0 0 * * *', tz: 'Europe/Istanbul' }, // her gün 00:00 TRT
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
    await this.queue.add(
      SUBSCRIPTION_JOBS.EXPIRE_PAST_DUE,
      {},
      {
        repeat: { pattern: '15 0 * * *', tz: 'Europe/Istanbul' }, // her gün 00:15 TRT
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
    await this.queue.add(
      SUBSCRIPTION_JOBS.EXPIRE_TRIALS,
      {},
      {
        repeat: { pattern: '30 0 * * *', tz: 'Europe/Istanbul' }, // her gün 00:30 TRT
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
    this.logger.log('Abonelik periyodik işleri zamanlandı (günlük 00:00 TRT)');
  }
}

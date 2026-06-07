import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { HEALTH_TOURISM_JOBS, QUEUES } from '@common/constants';

@Injectable()
export class HotelContentSyncProducer implements OnModuleInit {
  private readonly logger = new Logger(HotelContentSyncProducer.name);

  constructor(
    @InjectQueue(QUEUES.HEALTH_TOURISM) private readonly queue: Queue,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.queue.add(
      HEALTH_TOURISM_JOBS.SYNC_HOTEL_CONTENT,
      {},
      {
        repeat: { pattern: '0 3 * * *' }, // her gece 03:00
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
    this.logger.log('Hotelbeds otel içerik sync görevi zamanlandı (03:00)');
  }
}

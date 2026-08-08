import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { HEALTH_TOURISM_JOBS, QUEUES } from '@common/constants';
import { SyncHotelContentCommand } from '@modules/crm/health-tourism/hotel/application/commands/sync-hotel-content/sync-hotel-content.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

@Processor(QUEUES.HEALTH_TOURISM)
export class HotelContentSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(HotelContentSyncProcessor.name);

  constructor(private readonly commandBus: TSCommandBus) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case HEALTH_TOURISM_JOBS.SYNC_HOTEL_CONTENT:
        await this.handleSyncHotelContent();
        break;
      default:
        this.logger.warn(`Tanımlanmamış Health Tourism job: ${job.name}`);
    }
  }

  private async handleSyncHotelContent(): Promise<void> {
    this.logger.log('Hotelbeds otel içerik sync başladı');
    try {
      await this.commandBus.execute(new SyncHotelContentCommand());
    } catch (err) {
      this.logger.error('Hotelbeds otel içerik sync hatası', err);
      throw err;
    }
  }
}

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';
import { META_ADS_JOBS, QUEUES } from '@common/constants';
import { SyncCampaignMetricsCommand } from '@modules/meta-ads/application/commands/sync-campaign-metrics/sync-campaign-metrics.command';

@Processor(QUEUES.META_ADS)
export class MetaAdsSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(MetaAdsSyncProcessor.name);

  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case META_ADS_JOBS.SYNC_CAMPAIGN_METRICS:
        await this.handleSync();
        break;
      default:
        this.logger.warn(`Tanımlanmamış Meta Ads job: ${job.name}`);
    }
  }

  private async handleSync(): Promise<void> {
    this.logger.log('Meta Ads kampanya metrik senkronizasyonu başladı');
    try {
      await this.commandBus.execute(new SyncCampaignMetricsCommand());
    } catch (err) {
      this.logger.error('Meta Ads senkronizasyon hatası', err);
      throw err;
    }
  }
}

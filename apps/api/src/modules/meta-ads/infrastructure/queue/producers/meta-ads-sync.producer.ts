import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { META_ADS_JOBS, QUEUES } from '@common/constants';

@Injectable()
export class MetaAdsSyncProducer implements OnModuleInit {
  private readonly logger = new Logger(MetaAdsSyncProducer.name);

  constructor(
    @InjectQueue(QUEUES.META_ADS) private readonly metaAdsQueue: Queue,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.metaAdsQueue.add(
      META_ADS_JOBS.REFRESH_TOKENS,
      {},
      {
        repeat: { pattern: '0 1 * * *' }, // her gece 01:00 — sync'ten önce
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
    await this.metaAdsQueue.add(
      META_ADS_JOBS.SYNC_CAMPAIGN_METRICS,
      {},
      {
        repeat: { pattern: '0 2 * * *' }, // her gece 02:00
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
    this.logger.log('Meta Ads görevleri zamanlandı (token refresh: 01:00, sync: 02:00)');
  }
}

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';
import { MetaAdsSyncProducer } from './producers/meta-ads-sync.producer';
import { MetaAdsSyncProcessor } from './processors/meta-ads-sync.processor';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUES.META_ADS })],
  providers: [MetaAdsSyncProducer, MetaAdsSyncProcessor],
})
export class MetaAdsQueueModule {}

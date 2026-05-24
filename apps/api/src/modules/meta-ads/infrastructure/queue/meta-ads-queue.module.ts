import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CqrsModule } from '@nestjs/cqrs';
import { QUEUES } from '@common/constants';
import { MetaAdsSyncProducer } from './producers/meta-ads-sync.producer';
import { MetaAdsSyncProcessor } from './processors/meta-ads-sync.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUES.META_ADS }),
    CqrsModule,
  ],
  providers: [MetaAdsSyncProducer, MetaAdsSyncProcessor],
})
export class MetaAdsQueueModule {}

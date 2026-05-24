import { Module } from '@nestjs/common';
import { MetaAdsPresentationModule } from './presentation/meta-ads.presentation.module';
import { MetaAdsQueueModule } from './infrastructure/queue/meta-ads-queue.module';

@Module({
  imports: [MetaAdsPresentationModule, MetaAdsQueueModule],
})
export class MetaAdsModule {}

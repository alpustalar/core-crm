import { Module } from '@nestjs/common';
import {
  META_CAMPAIGN_METRIC_COMMAND_REPOSITORY,
  META_CAMPAIGN_METRIC_QUERY_REPOSITORY,
} from '@modules/meta-ads/domain/repositories/meta-campaign-metric.repository.interface';
import { MetaCampaignMetricCommandRepository } from './meta-campaign-metric.command.repository';
import { MetaCampaignMetricQueryRepository } from './meta-campaign-metric.query.repository';

@Module({
  providers: [
    {
      provide: META_CAMPAIGN_METRIC_COMMAND_REPOSITORY,
      useClass: MetaCampaignMetricCommandRepository,
    },
    {
      provide: META_CAMPAIGN_METRIC_QUERY_REPOSITORY,
      useClass: MetaCampaignMetricQueryRepository,
    },
  ],
  exports: [
    META_CAMPAIGN_METRIC_COMMAND_REPOSITORY,
    META_CAMPAIGN_METRIC_QUERY_REPOSITORY,
  ],
})
export class MetaCampaignMetricRepositoryModule {}

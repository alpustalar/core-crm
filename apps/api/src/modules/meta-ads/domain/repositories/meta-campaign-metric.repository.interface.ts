import { MetaCampaignMetric } from '@modules/meta-ads/domain/entities/meta-campaign-metric.entity';
import { UpsertCampaignMetricProps } from '@modules/meta-ads/domain/types/upsert-campaign-metric.props';

export const META_CAMPAIGN_METRIC_COMMAND_REPOSITORY = Symbol(
  'IMetaCampaignMetricCommandRepository',
);
export const META_CAMPAIGN_METRIC_QUERY_REPOSITORY = Symbol(
  'IMetaCampaignMetricQueryRepository',
);

export interface IMetaCampaignMetricCommandRepository {
  upsertMany(props: UpsertCampaignMetricProps[]): Promise<void>;
}

export interface IMetaCampaignMetricQueryRepository {
  findByAccountAndDateRange(props: {
    metaAdAccountId: string;
    from: Date;
    to: Date;
    campaignId?: string;
  }): Promise<MetaCampaignMetric[]>;
  aggregateByAccount(props: {
    clinicId: string;
    from: Date;
    to: Date;
    campaignId?: string;
  }): Promise<MetaCampaignMetric[]>;
}

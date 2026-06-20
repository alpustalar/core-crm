import { MetaCampaignMetric } from '@modules/crm/meta-ads/domain/entities/meta-campaign-metric.entity';
import { UpsertCampaignMetricData } from '@modules/crm/meta-ads/domain/meta-ads.contracts';

export const META_CAMPAIGN_METRIC_COMMAND_REPOSITORY = Symbol(
  'IMetaCampaignMetricCommandRepository'
);
export const META_CAMPAIGN_METRIC_QUERY_REPOSITORY = Symbol(
  'IMetaCampaignMetricQueryRepository'
);

export interface IMetaCampaignMetricCommandRepository {
  saveMany(data: UpsertCampaignMetricData[]): Promise<void>;
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

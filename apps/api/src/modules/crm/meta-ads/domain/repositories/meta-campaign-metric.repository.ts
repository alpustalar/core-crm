import { MetaCampaignMetric as IMetaCampaignMetric } from '@shared';
import { UpsertCampaignMetricData } from '@modules/crm/meta-ads/domain/contracts/meta-ads.contracts';

export const META_CAMPAIGN_METRIC_COMMAND_REPOSITORY = Symbol(
  'IMetaCampaignMetricCommandRepository'
);
export const META_CAMPAIGN_METRIC_QUERY_REPOSITORY = Symbol(
  'IMetaCampaignMetricQueryRepository'
);

export interface IMetaCampaignMetricCommandRepository {
  updateMany(data: UpsertCampaignMetricData[]): Promise<void>;
}

/** Kliniğin aktif reklam hesapları üzerinden dönemsel metrik toplama girişi. */
export interface AggregateCampaignMetricsFilter {
  clinicId: string;
  from: Date;
  to: Date;
  campaignId?: string;
}

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IMetaCampaignMetricQueryRepository {
  aggregateByAccount(
    filter: AggregateCampaignMetricsFilter
  ): Promise<IMetaCampaignMetric[]>;
}

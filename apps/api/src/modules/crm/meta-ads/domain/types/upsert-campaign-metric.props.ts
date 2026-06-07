export interface UpsertCampaignMetricProps {
  id: string;
  metaAdAccountId: string;
  campaignId: string;
  campaignName: string;
  date: Date;
  spend: number;
  clicks: number;
  impressions: number;
  cpc?: number | null;
  ctr?: number | null;
  currency?: string;
}

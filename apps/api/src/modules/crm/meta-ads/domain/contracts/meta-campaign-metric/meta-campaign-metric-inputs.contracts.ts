/** Repository katmanında doğrudan Prisma upsert'e paslanan senkronizasyon verisi. */
export interface UpsertCampaignMetricData {
  id: string;
  metaAdAccountId: string; // Meta API'sinden gelen ID
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

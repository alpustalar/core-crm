import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// META CAMPAIGN METRIC SCHEMA
/////////////////////////////////////////

export const MetaCampaignMetricSchema = z.object({
  currency: CurrencySchema,
  id: z.string(),
  metaAdAccountId: z.string(),
  campaignId: z.string(),
  campaignName: z.string(),
  date: z.coerce.date(),
  spend: decimalSchema("Field 'spend' must be a Decimal. Location: ['Models', 'MetaCampaignMetric']"),
  clicks: z.number().int(),
  impressions: z.number().int(),
  cpc: decimalSchema("Field 'cpc' must be a Decimal. Location: ['Models', 'MetaCampaignMetric']").nullable(),
  ctr: decimalSchema("Field 'ctr' must be a Decimal. Location: ['Models', 'MetaCampaignMetric']").nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type MetaCampaignMetric = z.infer<typeof MetaCampaignMetricSchema>

export default MetaCampaignMetricSchema;

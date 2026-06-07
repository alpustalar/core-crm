import { z } from 'zod';
import { Prisma } from '@prisma/client'

/////////////////////////////////////////
// META CAMPAIGN METRIC SCHEMA
/////////////////////////////////////////

export const MetaCampaignMetricSchema = z.object({
  id: z.uuid(),
  metaAdAccountId: z.string(),
  campaignId: z.string(),
  campaignName: z.string(),
  date: z.coerce.date(),
  spend: z.instanceof(Prisma.Decimal, { message: "Field 'spend' must be a Decimal. Location: ['Models', 'MetaCampaignMetric']"}),
  clicks: z.number().int(),
  impressions: z.number().int(),
  cpc: z.instanceof(Prisma.Decimal, { message: "Field 'cpc' must be a Decimal. Location: ['Models', 'MetaCampaignMetric']"}).nullable(),
  ctr: z.instanceof(Prisma.Decimal, { message: "Field 'ctr' must be a Decimal. Location: ['Models', 'MetaCampaignMetric']"}).nullable(),
  currency: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type MetaCampaignMetric = z.infer<typeof MetaCampaignMetricSchema>

export default MetaCampaignMetricSchema;

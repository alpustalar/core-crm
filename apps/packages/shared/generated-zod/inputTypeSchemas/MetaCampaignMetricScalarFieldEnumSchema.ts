import { z } from 'zod';

export const MetaCampaignMetricScalarFieldEnumSchema = z.enum(['id','metaAdAccountId','campaignId','campaignName','date','spend','clicks','impressions','cpc','ctr','currency','createdAt','updatedAt']);

export default MetaCampaignMetricScalarFieldEnumSchema;

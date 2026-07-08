import { z } from 'zod';
import { Pagination } from '@shared/common';
import { MetaLeadStatusSchema } from '@input-type-schemas/MetaLeadStatusSchema';

export const UpsertCampaignMetricDataSchema = z.object({
  id: z.uuid(),
  metaAdAccountId: z.string(), // Meta API'sinden gelen ID
  campaignId: z.string(),
  campaignName: z.string(),
  date: z.date(),
  spend: z.number(),
  clicks: z.number(),
  impressions: z.number(),
  cpc: z.number().nullable().optional(),
  ctr: z.number().nullable().optional(),
  currency: z.string().optional(),
});
export type UpsertCampaignMetricData = z.infer<
  typeof UpsertCampaignMetricDataSchema
>;

export const FindMetaLeadsFilterSchema = z.object({
  clinicId: z.uuid(),
  status: MetaLeadStatusSchema.optional(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});
export type FindMetaLeadsFilter = z.infer<typeof FindMetaLeadsFilterSchema>;

export const CreateMetaLeadDataSchema = z.object({
  id: z.uuid(),
  metaAdAccountId: z.string(),
  metaLeadId: z.string(),
  formId: z.string().nullable().optional(),
  campaignId: z.string().nullable().optional(),
  campaignName: z.string().nullable().optional(),
  adsetId: z.string().nullable().optional(),
  adId: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email('Geçersiz e-posta formatı').nullable().optional(),

  rawData: z.record(z.string(), z.unknown()).nullable().optional(),
});
export type CreateMetaLeadData = z.infer<typeof CreateMetaLeadDataSchema>;

export const CreateMetaAdAccountDataSchema = z.object({
  id: z.uuid(),
  clinicId: z.uuid(),
  adAccountId: z.string(),
  accessToken: z.string(),
  tokenExpiresAt: z.date().nullable().optional(),
  pageId: z.string().optional(),
  businessName: z.string().optional(),
});
export type CreateMetaAdAccountData = z.infer<
  typeof CreateMetaAdAccountDataSchema
>;

export const CreateMetaAdAccountPropsSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid('Klinik ID geçerli bir UUID olmalıdır'),

  // Meta'dan gelen teknik alanlar
  adAccountId: z.string().min(1, 'Ad Account ID boş olamaz'),
  accessToken: z.string().min(1, 'Access Token boş olamaz'),
  pageId: z.string().nullable().optional(),

  businessName: z.string().nullable().optional(),

  // Token süresi yönetimi
  tokenExpiresAt: z.date().nullable().optional(),
});

export type CreateMetaAdAccountProps = z.infer<
  typeof CreateMetaAdAccountPropsSchema
>;

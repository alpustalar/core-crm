import { z } from 'zod';
import { Pagination } from '@shared/common';
import { MetaLeadStatusSchema } from '@input-type-schemas/MetaLeadStatusSchema';
import { LogSource } from '@src/domain/constants/log-action.constant';

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
  email: z.email('Geçersiz e-posta formatı').nullable().optional(),

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

  // Audit izi — event entity içinde raise edildiği için aktör bilgisi props ile taşınır
  actorId: z.string().optional(),
  logSource: z.enum(LogSource).optional(),
});

export type CreateMetaAdAccountProps = z.infer<
  typeof CreateMetaAdAccountPropsSchema
>;

/** Hesap bağlantısını kesme (deactivate) — yalnız audit izi taşır. */
export const DeactivateMetaAdAccountPropsSchema = z.object({
  actorId: z.string().optional(),
  logSource: z.enum(LogSource).optional(),
});

export type DeactivateMetaAdAccountProps = z.infer<
  typeof DeactivateMetaAdAccountPropsSchema
>;

export const oAuthStatePayloadSchema = z.object({
  clinicId: z.uuid(),
  userId: z.uuid(),
});

export type OAuthStatePayload = z.infer<typeof oAuthStatePayloadSchema>;

export function isOAuthStatePayload(data: unknown): data is OAuthStatePayload {
  return oAuthStatePayloadSchema.safeParse(data).success;
}

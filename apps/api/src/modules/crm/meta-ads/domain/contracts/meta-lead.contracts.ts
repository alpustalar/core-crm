import { z } from 'zod';
import { JsonValueSchema } from '@input-type-schemas/JsonValueSchema'; // Mevcut yapına göre

export const CreateMetaLeadPropsSchema = z.object({
  id: z.uuid().optional(),
  metaAdAccountId: z.string().min(1, 'Ad Account ID zorunludur'),
  metaLeadId: z.string().min(1, 'Meta Lead ID zorunludur'),

  formId: z.string().nullable().optional(),
  campaignId: z.string().nullable().optional(),
  campaignName: z.string().nullable().optional(),
  adsetId: z.string().nullable().optional(),
  adId: z.string().nullable().optional(),

  name: z.string().nullable().optional(),

  phone: z.string().nullable().optional(),
  email: z.email('Geçersiz e-posta formatı').nullable().optional(),

  rawData: JsonValueSchema,
});

export type CreateMetaLeadProps = z.infer<typeof CreateMetaLeadPropsSchema>;

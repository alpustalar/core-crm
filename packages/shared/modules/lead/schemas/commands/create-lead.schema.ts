import { z } from 'zod';
import LeadSourceSchema from '@shared/generated-zod/inputTypeSchemas/LeadSourceSchema';
import LeadMediumSchema from '@shared/generated-zod/inputTypeSchemas/LeadMediumSchema';


export const CreateLeadSchema = z.object({
  source: LeadSourceSchema,
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.email().optional(),
  notes: z.string().optional(),
  assignedToId: z.uuid().optional(),

  // Attribution — reklam/kaynak kökeni (CTWA referral veya Meta Lead Ads formu).
  medium: LeadMediumSchema.optional(),
  metaLeadId: z.string().optional(),
  campaignId: z.string().optional(),
  campaignName: z.string().optional(),
  adId: z.string().optional(),
  adsetId: z.string().optional(),
  ctwaClid: z.string().optional(),
  sourceUrl: z.string().optional(),
});

import { z } from 'zod';

/////////////////////////////////////////
// PROVIDER SCHEMA
/////////////////////////////////////////

export const ProviderSchema = z.object({
  id: z.uuid(),
  publicPhone: z.string().nullable(),
  publicEmail: z.string().nullable(),
  isActive: z.boolean(),
  canAcceptExamination: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  clinicId: z.string(),
  userId: z.string(),
  sectorId: z.string().nullable(),
  providerTitleId: z.string().nullable(),
  providerSpecialtyId: z.string().nullable(),
})

export type Provider = z.infer<typeof ProviderSchema>

export default ProviderSchema;

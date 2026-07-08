import { z } from 'zod';
import { Prisma } from '@prisma/client'

/////////////////////////////////////////
// PROVIDER TREATMENT SCHEMA
/////////////////////////////////////////

export const ProviderTreatmentSchema = z.object({
  id: z.string(),
  providerId: z.string(),
  customPrice: z.instanceof(Prisma.Decimal, { message: "Field 'customPrice' must be a Decimal. Location: ['Models', 'ProviderTreatment']"}).nullable(),
  customDuration: z.number().int().nullable(),
  isActive: z.boolean(),
  updatedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date().nullable(),
  treatmentId: z.string(),
})

export type ProviderTreatment = z.infer<typeof ProviderTreatmentSchema>

export default ProviderTreatmentSchema;

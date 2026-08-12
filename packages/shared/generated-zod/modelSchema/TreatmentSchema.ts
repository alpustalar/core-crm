import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// TREATMENT SCHEMA
/////////////////////////////////////////

export const TreatmentSchema = z.object({
  currency: CurrencySchema,
  id: z.string(),
  slug: z.string(),
  treatmentCategoryId: z.string(),
  duration: z.number().int().nullable(),
  minDuration: z.number().int().nullable(),
  maxDuration: z.number().int().nullable(),
  sutCode: z.string().nullable(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  requiresApproval: z.boolean(),
  isPackageOnly: z.boolean(),
  displayOrder: z.number().int(),
  listPrice: decimalSchema("Field 'listPrice' must be a Decimal. Location: ['Models', 'Treatment']").nullable(),
  clinicId: z.string(),
  masterTreatmentId: z.string().nullable(),
  createdAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
})

export type Treatment = z.infer<typeof TreatmentSchema>

export default TreatmentSchema;

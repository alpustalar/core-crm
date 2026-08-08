import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// TREATMENT PACKAGE SCHEMA
/////////////////////////////////////////

export const TreatmentPackageSchema = z.object({
  currency: CurrencySchema,
  id: z.string(),
  clinicId: z.string(),
  name: z.string(),
  examinationCount: z.number().int(),
  controlCount: z.number().int(),
  validityDays: z.number().int(),
  price: decimalSchema("Field 'price' must be a Decimal. Location: ['Models', 'TreatmentPackage']"),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type TreatmentPackage = z.infer<typeof TreatmentPackageSchema>

export default TreatmentPackageSchema;

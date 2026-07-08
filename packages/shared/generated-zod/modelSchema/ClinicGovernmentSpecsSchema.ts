import { z } from 'zod';
import { ClinicLegalTypeSchema } from '../inputTypeSchemas/ClinicLegalTypeSchema'

/////////////////////////////////////////
// CLINIC GOVERNMENT SPECS SCHEMA
/////////////////////////////////////////

export const ClinicGovernmentSpecsSchema = z.object({
  legalType: ClinicLegalTypeSchema,
  id: z.string(),
  clinicId: z.string(),
  healthFacilityCode: z.string(),
  ussPassword: z.string().nullable(),
  companyTaxNumber: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ClinicGovernmentSpecs = z.infer<typeof ClinicGovernmentSpecsSchema>

export default ClinicGovernmentSpecsSchema;

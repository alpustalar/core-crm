import { z } from 'zod';

/////////////////////////////////////////
// CLINIC GOVERNMENT SPECS SCHEMA
/////////////////////////////////////////

export const ClinicGovernmentSpecsSchema = z.object({
  id: z.uuid(),
  healthFacilityCode: z.string(),
  ussPassword: z.string().nullable(),
  companyTaxNumber: z.string().nullable(),
  clinicId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ClinicGovernmentSpecs = z.infer<typeof ClinicGovernmentSpecsSchema>

export default ClinicGovernmentSpecsSchema;

import { z } from 'zod';

/////////////////////////////////////////
// TREATMENT PACKAGE PROVIDER SCHEMA
/////////////////////////////////////////

export const TreatmentPackageProviderSchema = z.object({
  id: z.string(),
  packageId: z.string(),
  providerId: z.string(),
})

export type TreatmentPackageProvider = z.infer<typeof TreatmentPackageProviderSchema>

export default TreatmentPackageProviderSchema;

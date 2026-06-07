import { z } from 'zod';

/////////////////////////////////////////
// TREATMENT PACKAGE ITEM SCHEMA
/////////////////////////////////////////

export const TreatmentPackageItemSchema = z.object({
  id: z.uuid(),
  packageId: z.string(),
  treatmentId: z.string(),
  count: z.number().int(),
})

export type TreatmentPackageItem = z.infer<typeof TreatmentPackageItemSchema>

export default TreatmentPackageItemSchema;

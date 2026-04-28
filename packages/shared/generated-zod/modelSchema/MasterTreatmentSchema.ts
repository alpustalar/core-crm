import { z } from 'zod';

/////////////////////////////////////////
// MASTER TREATMENT SCHEMA
/////////////////////////////////////////

export const MasterTreatmentSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  sectorId: z.string(),
  treatmentCategoryId: z.string(),
  defaultDuration: z.number().int(),
})

export type MasterTreatment = z.infer<typeof MasterTreatmentSchema>

export default MasterTreatmentSchema;

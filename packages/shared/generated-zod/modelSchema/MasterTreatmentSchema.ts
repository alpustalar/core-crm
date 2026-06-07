import { z } from 'zod';

/////////////////////////////////////////
// MASTER TREATMENT SCHEMA
/////////////////////////////////////////

export const MasterTreatmentSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  treatmentCategoryId: z.string(),
  defaultDuration: z.number().int(),
  sutCode: z.string().nullable(),
})

export type MasterTreatment = z.infer<typeof MasterTreatmentSchema>

export default MasterTreatmentSchema;

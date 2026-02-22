import { z } from 'zod';
import { TreatmentCategorySchema } from '../inputTypeSchemas/TreatmentCategorySchema'

/////////////////////////////////////////
// MASTER TREATMENT SCHEMA
/////////////////////////////////////////

export const MasterTreatmentSchema = z.object({
  category: TreatmentCategorySchema,
  id: z.uuid(),
  name: z.string(),
  defaultDuration: z.number().int(),
})

export type MasterTreatment = z.infer<typeof MasterTreatmentSchema>

export default MasterTreatmentSchema;

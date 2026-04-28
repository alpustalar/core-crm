import { z } from 'zod';

/////////////////////////////////////////
// TREATMENT CATEGORY SCHEMA
/////////////////////////////////////////

export const TreatmentCategorySchema = z.object({
  id: z.uuid(),
  sectorId: z.string(),
  slug: z.string(),
})

export type TreatmentCategory = z.infer<typeof TreatmentCategorySchema>

export default TreatmentCategorySchema;

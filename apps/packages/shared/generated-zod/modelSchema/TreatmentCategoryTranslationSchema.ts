import { z } from 'zod';

/////////////////////////////////////////
// TREATMENT CATEGORY TRANSLATION SCHEMA
/////////////////////////////////////////

export const TreatmentCategoryTranslationSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  languageId: z.string(),
  treatmentCategoryId: z.string(),
})

export type TreatmentCategoryTranslation = z.infer<typeof TreatmentCategoryTranslationSchema>

export default TreatmentCategoryTranslationSchema;

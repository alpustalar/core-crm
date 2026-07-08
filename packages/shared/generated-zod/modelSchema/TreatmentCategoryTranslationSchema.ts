import { z } from 'zod';

/////////////////////////////////////////
// TREATMENT CATEGORY TRANSLATION SCHEMA
/////////////////////////////////////////

export const TreatmentCategoryTranslationSchema = z.object({
  id: z.string(),
  languageId: z.string(),
  treatmentCategoryId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
})

export type TreatmentCategoryTranslation = z.infer<typeof TreatmentCategoryTranslationSchema>

export default TreatmentCategoryTranslationSchema;

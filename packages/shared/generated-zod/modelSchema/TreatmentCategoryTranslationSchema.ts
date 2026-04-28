import { z } from 'zod';

/////////////////////////////////////////
// TREATMENT CATEGORY TRANSLATION SCHEMA
/////////////////////////////////////////

export const TreatmentCategoryTranslationSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  languageId: z.string(),
  treatmentCategoryId: z.string(),
})

export type TreatmentCategoryTranslation = z.infer<typeof TreatmentCategoryTranslationSchema>

export default TreatmentCategoryTranslationSchema;

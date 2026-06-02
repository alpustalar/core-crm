import { z } from 'zod';

/////////////////////////////////////////
// TREATMENT TRANSLATION SCHEMA
/////////////////////////////////////////

export const TreatmentTranslationSchema = z.object({
  id: z.uuid(),
  masterTreatmentId: z.string().nullable(),
  languageId: z.string(),
  treatmentId: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  aftercareInstructions: z.string().nullable(),
})

export type TreatmentTranslation = z.infer<typeof TreatmentTranslationSchema>

export default TreatmentTranslationSchema;

import { z } from 'zod';

/////////////////////////////////////////
// PROVIDER SPECIALTY TRANSLATION SCHEMA
/////////////////////////////////////////

export const ProviderSpecialtyTranslationSchema = z.object({
  id: z.uuid(),
  specialtyId: z.string(),
  languageId: z.string(),
  name: z.string(),
})

export type ProviderSpecialtyTranslation = z.infer<typeof ProviderSpecialtyTranslationSchema>

export default ProviderSpecialtyTranslationSchema;

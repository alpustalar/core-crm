import { z } from 'zod';

/////////////////////////////////////////
// PROVIDER TITLE TRANSLATION SCHEMA
/////////////////////////////////////////

export const ProviderTitleTranslationSchema = z.object({
  id: z.string(),
  titleId: z.string(),
  languageId: z.string(),
  name: z.string(),
  abbreviation: z.string().nullable(),
})

export type ProviderTitleTranslation = z.infer<typeof ProviderTitleTranslationSchema>

export default ProviderTitleTranslationSchema;

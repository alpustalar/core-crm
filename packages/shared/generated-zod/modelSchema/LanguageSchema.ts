import { z } from 'zod';

/////////////////////////////////////////
// LANGUAGE SCHEMA
/////////////////////////////////////////

export const LanguageSchema = z.object({
  id: z.uuid(),
  code: z.string(),
  name: z.string(),
  direction: z.string(),
  isActive: z.boolean(),
})

export type Language = z.infer<typeof LanguageSchema>

export default LanguageSchema;

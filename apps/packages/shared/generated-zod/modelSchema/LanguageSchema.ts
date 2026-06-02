import { z } from 'zod';
import { LanguageDirectionSchema } from '../inputTypeSchemas/LanguageDirectionSchema'

/////////////////////////////////////////
// LANGUAGE SCHEMA
/////////////////////////////////////////

export const LanguageSchema = z.object({
  direction: LanguageDirectionSchema,
  id: z.uuid(),
  code: z.string(),
  name: z.string(),
  isActive: z.boolean(),
})

export type Language = z.infer<typeof LanguageSchema>

export default LanguageSchema;

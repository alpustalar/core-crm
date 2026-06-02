import { z } from 'zod';

export const LanguageDirectionSchema = z.enum(['LTR','RTL']);

export type LanguageDirectionType = `${z.infer<typeof LanguageDirectionSchema>}`

export default LanguageDirectionSchema;

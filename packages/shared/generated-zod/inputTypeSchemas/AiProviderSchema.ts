import { z } from 'zod';

export const AiProviderSchema = z.enum(['ANTHROPIC','GEMINI']);

export type AiProviderType = `${z.infer<typeof AiProviderSchema>}`

export default AiProviderSchema;

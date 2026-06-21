import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'

/////////////////////////////////////////
// CLINIC AI AGENT CONFIG SCHEMA
/////////////////////////////////////////

/**
 * Kliniğin AI sohbet asistanı config'i (messaging bounded-context) — Clinic'ten ayrıştırılmış
 * 1:1 satellite. Gelen WhatsApp mesajlarına otomatik yanıt için persona + (şifreli) Anthropic
 * anahtarı + model tutar. Anahtar yoksa platform fallback (ENV.ANTHROPIC_API_KEY) kullanılır.
 */
export const ClinicAiAgentConfigSchema = z.object({
  id: z.uuid(),
  isEnabled: z.boolean(),
  model: z.string(),
  systemPrompt: z.string().nullable(),
  apiKey: z.string().nullable(),
  maxTokens: z.number().int().nullable(),
  replyOnlyWithinWindow: z.boolean(),
  businessHours: JsonValueSchema.nullable(),
  clinicId: z.string(),
  organizationId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ClinicAiAgentConfig = z.infer<typeof ClinicAiAgentConfigSchema>

export default ClinicAiAgentConfigSchema;

import { z } from 'zod';

/**
 * Kliniğin AI sohbet asistanı config'ini oluşturur/günceller (upsert). Tüm alanlar
 * opsiyonel — yalnız gönderilenler güncellenir. apiKey gönderilmezse mevcut korunur.
 */
export const ConfigureAiAgentSchema = z.object({
  isEnabled: z.boolean().optional(),
  // Sağlayıcı seçimi: ANTHROPIC (Claude) veya GEMINI (ucuz alternatif).
  provider: z.enum(['ANTHROPIC', 'GEMINI']).optional(),
  model: z.string().min(1).optional(),
  systemPrompt: z.string().optional(),
  apiKey: z.string().min(1).optional(),
  maxTokens: z.number().int().positive().optional(),
  replyOnlyWithinWindow: z.boolean().optional(),
});

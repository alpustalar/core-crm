import { z } from 'zod';
import { TelegramProviderSchema } from '../inputTypeSchemas/TelegramProviderSchema'
import { TelegramChannelStatusSchema } from '../inputTypeSchemas/TelegramChannelStatusSchema'

/////////////////////////////////////////
// CLINIC TELEGRAM CHANNEL SCHEMA
/////////////////////////////////////////

/**
 * Kliniğin Telegram kanal config'i (messaging bounded-context) — Clinic'ten ayrıştırılmış
 * satellite. Hibrit: provider=BOT_API (BotFather token + webhook) veya MTPROTO (numarayla
 * kullanıcı hesabı, GramJS StringSession). Token/session şifreli (TokenCipherService).
 */
export const ClinicTelegramChannelSchema = z.object({
  provider: TelegramProviderSchema,
  status: TelegramChannelStatusSchema,
  id: z.uuid(),
  botTokenEnc: z.string().nullable(),
  botUsername: z.string().nullable(),
  webhookSecret: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  mtprotoSessionEnc: z.string().nullable(),
  lastError: z.string().nullable(),
  clinicId: z.string(),
  organizationId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ClinicTelegramChannel = z.infer<typeof ClinicTelegramChannelSchema>

export default ClinicTelegramChannelSchema;

import { z } from 'zod';

/////////////////////////////////////////
// CLINIC INSTAGRAM CHANNEL SCHEMA
/////////////////////////////////////////

/**
 * Kliniğin Instagram DM kanal config'i (messaging bounded-context) — Clinic'ten ayrıştırılmış
 * 1:1 satellite. Meta Graph API (Messenger Platform); igUserId = Instagram profesyonel hesap
 * id'si (webhook routing + gönderim hedefi). accessToken (Page/IG token) şifreli saklanır.
 */
export const ClinicInstagramChannelSchema = z.object({
  id: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  igUserId: z.string(),
  pageId: z.string().nullable(),
  username: z.string().nullable(),
  accessToken: z.string().nullable(),
  isActive: z.boolean(),
  tokenExpiresAt: z.coerce.date().nullable(),
  lastError: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ClinicInstagramChannel = z.infer<typeof ClinicInstagramChannelSchema>

export default ClinicInstagramChannelSchema;

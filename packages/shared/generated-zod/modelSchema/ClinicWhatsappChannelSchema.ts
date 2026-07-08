import { z } from 'zod';

/////////////////////////////////////////
// CLINIC WHATSAPP CHANNEL SCHEMA
/////////////////////////////////////////

/**
 * Kliniğin WhatsApp Business kanal config'i (messaging bounded-context) — Clinic'ten
 * ayrıştırılmış 1:1 satellite. Webhook gelen olayı phoneNumberId ile bu kayda routing eder.
 */
export const ClinicWhatsappChannelSchema = z.object({
  id: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  phoneNumberId: z.string(),
  wabaId: z.string().nullable(),
  displayPhoneNumber: z.string().nullable(),
  accessToken: z.string().nullable(),
  verifyToken: z.string().nullable(),
  isActive: z.boolean(),
  registrationPin: z.string().nullable(),
  registeredAt: z.coerce.date().nullable(),
  tokenExpiresAt: z.coerce.date().nullable(),
  qualityRating: z.string().nullable(),
  messagingTier: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ClinicWhatsappChannel = z.infer<typeof ClinicWhatsappChannelSchema>

export default ClinicWhatsappChannelSchema;

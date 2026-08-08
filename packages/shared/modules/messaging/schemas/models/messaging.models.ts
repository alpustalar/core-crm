import { z } from 'zod';
import {
  AiProviderSchema,
  ConversationStatusSchema,
  MessageDirectionSchema,
  MessageStatusSchema,
  MessageTypeSchema,
  MessageChannelSchema,
  TelegramChannelStatusSchema,
  TelegramProviderSchema,
} from '../enums';

/**
 * Messaging bounded-context'inin kalıcı model sözleşmeleri (read-model / plain shape).
 *
 * Önce Prisma şemasından üretiliyorlardı; messaging verisi MongoDB'ye taşındığı için
 * artık elle yazılırlar. Alan adları ve nullability taşınan Postgres verisiyle birebir
 * aynıdır — entity constructor'ları ve `toPersistence()` çıktıları değişmeden çalışır.
 */

/**
 * Prisma'nın `Json` alanlarının karşılığı. Bilinçli olarak DIŞA AÇILMAZ: `@shared`
 * barrel'ında generated-zod'un `JsonValueSchema`'sı zaten var, aynı adı ikinci kez
 * export etmek belirsizlik hatası üretir.
 */
const jsonValueSchema: z.ZodType<unknown> = z.unknown();

/**
 * Bir kontak ile yazışma başlığı (thread). `clinicId` denormalize scalar'dır
 * (bounded-context: başka modülün koleksiyonuna referans kurulmaz). Kontak, hasta/lead
 * ile ilkel id üzerinden eşlenir.
 */
export const ConversationSchema = z.object({
  status: ConversationStatusSchema,
  channel: MessageChannelSchema,
  id: z.string(),
  organizationId: z.string(),
  clinicId: z.string(),
  assignedUserId: z.string().nullable(),
  lastMessageAt: z.coerce.date().nullable(),
  patientId: z.string().nullable(),
  leadId: z.string().nullable(),
  lastInboundAt: z.coerce.date().nullable(),
  contactPhone: z.string(),
  contactName: z.string().nullable(),
  unreadCount: z.number().int(),
  agentReadAt: z.coerce.date().nullable(),
  windowExpiresAt: z.coerce.date().nullable(),
  marketingOptOut: z.boolean(),
  optOutAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Conversation = z.infer<typeof ConversationSchema>;

/** Yazışma içindeki tek mesaj (gelen/giden). */
export const MessageSchema = z.object({
  direction: MessageDirectionSchema,
  type: MessageTypeSchema,
  status: MessageStatusSchema,
  id: z.string(),
  conversationId: z.string(),
  externalId: z.string().nullable(),
  sentByUserId: z.string().nullable(),
  replyToExternalId: z.string().nullable(),
  body: z.string().nullable(),
  mediaUrl: z.string().nullable(),
  errorReason: z.string().nullable(),
  errorCode: z.string().nullable(),
  payload: jsonValueSchema.nullable(),
  mediaType: z.string().nullable(),
  pricingCategory: z.string().nullable(),
  billable: z.boolean().nullable(),
  templateName: z.string().nullable(),
  templateLanguage: z.string().nullable(),
  templateParams: jsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Message = z.infer<typeof MessageSchema>;

/** Kliniğin WhatsApp Business kanal config'i. Token alanları şifreli saklanır. */
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
});
export type ClinicWhatsappChannel = z.infer<typeof ClinicWhatsappChannelSchema>;

/** Kliniğin Telegram kanal config'i (BOT_API / MTPROTO). Token/session şifreli. */
export const ClinicTelegramChannelSchema = z.object({
  provider: TelegramProviderSchema,
  status: TelegramChannelStatusSchema,
  id: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  botTokenEnc: z.string().nullable(),
  botUsername: z.string().nullable(),
  webhookSecret: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  mtprotoSessionEnc: z.string().nullable(),
  lastError: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type ClinicTelegramChannel = z.infer<typeof ClinicTelegramChannelSchema>;

/** Kliniğin Instagram DM kanal config'i (Meta Graph API / Messenger Platform). */
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
});
export type ClinicInstagramChannel = z.infer<
  typeof ClinicInstagramChannelSchema
>;

/** Kliniğin AI sohbet asistanı config'i: persona + (şifreli) sağlayıcı anahtarı + model. */
export const ClinicAiAgentConfigSchema = z.object({
  provider: AiProviderSchema,
  id: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  isEnabled: z.boolean(),
  model: z.string(),
  systemPrompt: z.string().nullable(),
  apiKey: z.string().nullable(),
  maxTokens: z.number().int().nullable(),
  replyOnlyWithinWindow: z.boolean(),
  businessHours: jsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type ClinicAiAgentConfig = z.infer<typeof ClinicAiAgentConfigSchema>;

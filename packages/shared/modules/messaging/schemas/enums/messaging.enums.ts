import { z } from 'zod';

/**
 * Messaging bounded-context'inin enum sözleşmeleri.
 *
 * Bu tanımlar önce Prisma şemasından (`zod-prisma-types`) üretiliyordu. Messaging kendi
 * verisine MongoDB üzerinde sahip olduğu için artık elle yazılır: sözleşme, başka bir
 * servisin veritabanı şemasından türetilmez. Değerler Postgres'teki enum değerleriyle
 * birebir aynıdır — taşınan veri olduğu gibi geçerlidir.
 */

export const MessageChannelSchema = z.enum([
  'WHATSAPP',
  'TELEGRAM',
  'INSTAGRAM',
]);
export type MessageChannelType = `${z.infer<typeof MessageChannelSchema>}`;

export const MessageDirectionSchema = z.enum(['INBOUND', 'OUTBOUND']);
export type MessageDirectionType = `${z.infer<typeof MessageDirectionSchema>}`;

export const MessageTypeSchema = z.enum([
  'TEXT',
  'TEMPLATE',
  'MEDIA',
  'INTERACTIVE', // buton/liste yanıtı (button_reply / list_reply)
  'LOCATION',
  'CONTACTS',
  'REACTION', // bir mesaja emoji reaksiyon
  'UNSUPPORTED', // kanalın desteklemediği/parse edilemeyen gelen tip
]);
export type MessageTypeType = `${z.infer<typeof MessageTypeSchema>}`;

export const MessageStatusSchema = z.enum([
  'RECEIVED', // gelen mesaj (inbound)
  'QUEUED', // giden, henüz gönderilmedi
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED',
]);
export type MessageStatusType = `${z.infer<typeof MessageStatusSchema>}`;

export const ConversationStatusSchema = z.enum(['OPEN', 'PENDING', 'CLOSED']);
export type ConversationStatusType = `${z.infer<
  typeof ConversationStatusSchema
>}`;

export const AiProviderSchema = z.enum([
  'ANTHROPIC', // Claude modelleri (varsayılan)
  'GEMINI', // Google Gemini (ucuz alternatif)
]);
export type AiProviderType = `${z.infer<typeof AiProviderSchema>}`;

export const TelegramProviderSchema = z.enum([
  'BOT_API', // BotFather token + webhook (varsayılan, önerilen)
  'MTPROTO', // kliniğin kendi numarasıyla kullanıcı hesabı (GramJS)
]);
export type TelegramProviderType = `${z.infer<typeof TelegramProviderSchema>}`;

export const TelegramChannelStatusSchema = z.enum([
  'PENDING', // MTProto giriş başladı (kod bekleniyor) ya da bağlanmadı
  'ACTIVE',
  'ERROR',
  'REVOKED', // bağlantı kesildi / logout
]);
export type TelegramChannelStatusType = `${z.infer<
  typeof TelegramChannelStatusSchema
>}`;

/**
 * Prisma'nın ürettiği enum'larla **aynı kullanım şekli**: `MessageChannel.WHATSAPP`
 * (değer) ve `channel: MessageChannel` (tip). Prisma client'tan gelen enum'lar bu iki
 * konumda da kullanılıyordu; taşımanın tüketici tarafında görünmez kalması için ikisi
 * de aynı adla sağlanır.
 */
export const MessageChannel = MessageChannelSchema.enum;
export type MessageChannel = MessageChannelType;

export const MessageDirection = MessageDirectionSchema.enum;
export type MessageDirection = MessageDirectionType;

export const MessageType = MessageTypeSchema.enum;
export type MessageType = MessageTypeType;

export const MessageStatus = MessageStatusSchema.enum;
export type MessageStatus = MessageStatusType;

export const ConversationStatus = ConversationStatusSchema.enum;
export type ConversationStatus = ConversationStatusType;

export const AiProvider = AiProviderSchema.enum;
export type AiProvider = AiProviderType;

export const TelegramProvider = TelegramProviderSchema.enum;
export type TelegramProvider = TelegramProviderType;

export const TelegramChannelStatus = TelegramChannelStatusSchema.enum;
export type TelegramChannelStatus = TelegramChannelStatusType;

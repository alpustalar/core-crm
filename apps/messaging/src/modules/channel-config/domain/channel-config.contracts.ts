import { z } from 'zod';

// ==========================================
// WHATSAPP KANAL OLUŞTURMA SÖZLEŞMELERİ (PROPS)
// ==========================================

export const CreateClinicWhatsappChannelPropsSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(), // Katı iç sistem ID doğrulaması
  organizationId: z.uuid(), // Katı iç sistem ID doğrulaması

  // Meta Cloud API bileşenleri (Orijinal yapıya sadık kalınarak Meta formatında string):
  phoneNumberId: z.string().min(1, 'Meta Phone Number ID boş bırakılamaz'),
  wabaId: z.string().nullable().optional(), // WhatsApp Business Account ID

  displayPhoneNumber: z.string().nullable().optional(), // Örn: "+90532..."
  accessToken: z.string().nullable().optional(), // Meta Sistem Kullanıcısı Token'ı
  verifyToken: z.string().nullable().optional(), // Webhook doğrulama token'ı

  isActive: z.boolean().optional(), // Varsayılan değer iş mantığında (true/false) atanabilir

  registrationPin: z.string().nullable().optional(), // 2FA 6 haneli pin kodu
  registeredAt: z.date().nullable().optional(),
  tokenExpiresAt: z.date().nullable().optional(),

  // Meta platform metrikleri:
  qualityRating: z.string().nullable().optional(), // Örn: GREEN, YELLOW, RED
  messagingTier: z.string().nullable().optional(), // Örn: TIER_250K, UNLIMITED
});

export type CreateClinicWhatsappChannelProps = z.infer<
  typeof CreateClinicWhatsappChannelPropsSchema
>;

// ==========================================
// TELEGRAM KANAL OLUŞTURMA SÖZLEŞMELERİ (PROPS)
// ==========================================

export const CreateClinicTelegramBotChannelPropsSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),

  // BotFather token'ı zaten şifrelenmiş (TokenCipherService) olarak gelir.
  botTokenEnc: z.string().min(1, 'Şifreli bot token boş bırakılamaz'),
  botUsername: z.string().nullable().optional(),
  // Klinik bazlı webhook secret_token (setWebhook ile kuruldu).
  webhookSecret: z.string().min(1, 'Webhook secret boş bırakılamaz'),
});

export type CreateClinicTelegramBotChannelProps = z.infer<
  typeof CreateClinicTelegramBotChannelPropsSchema
>;

// ==========================================
// INSTAGRAM KANAL OLUŞTURMA SÖZLEŞMELERİ (PROPS)
// ==========================================

export const CreateClinicInstagramChannelPropsSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),

  // Instagram professional account id (webhook routing + gönderim hedefi).
  igUserId: z.string().min(1, 'Instagram hesap id boş bırakılamaz'),
  pageId: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  // Page/IG erişim token'ı zaten şifrelenmiş (TokenCipherService) olarak gelir.
  accessToken: z.string().nullable().optional(),
  tokenExpiresAt: z.date().nullable().optional(),
});

export type CreateClinicInstagramChannelProps = z.infer<
  typeof CreateClinicInstagramChannelPropsSchema
>;

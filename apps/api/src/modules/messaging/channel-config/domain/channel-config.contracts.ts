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

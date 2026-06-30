import { z } from 'zod';

/**
 * Klinik kendi Instagram (professional) hesabını Facebook/Instagram Login ile bağlar.
 * FE login akışından dönen yetki kodu + hesap kimliği gelir; backend kodu token'a çevirir,
 * hesabı app webhook'una abone eder ve kanalı (şifreli token ile) kaydeder.
 */
export const ConnectInstagramChannelSchema = z.object({
  /** Facebook/Instagram Login'den dönen yetki kodu. */
  code: z.string().min(1),
  /** Instagram professional account id (webhook routing + gönderim hedefi). */
  igUserId: z.string().min(1),
  /** Bağlı Facebook Page id (FB Login akışında). */
  pageId: z.string().optional(),
  /** IG kullanıcı adı (gösterim). */
  username: z.string().optional(),
});

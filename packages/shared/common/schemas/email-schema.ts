import { z } from 'zod';

/**
 * Normalize edilmiş e-posta adresi.
 *
 * Sıra önemlidir: `z.email().trim()` YANLIŞTIR — doğrulama trim'den önce koşar,
 * bu yüzden kopyala-yapıştırla gelen `"ali@klinik.com "` temizlenmez, reddedilir.
 * Önce boşluk/harf normalizasyonu yapılır, sonucun geçerli bir adres olduğu
 * `.pipe()` ile doğrulanır.
 */
export const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: 'Geçersiz e-posta formatı' }));

export type EmailType = z.infer<typeof EmailSchema>;

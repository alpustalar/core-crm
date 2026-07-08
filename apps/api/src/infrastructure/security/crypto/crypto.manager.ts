import * as crypto from 'crypto';

export class CryptoManager {
  /**
   * Dış servislerden (Meta, Stripe, Iyzico vb.) gelen webhook isteklerinin
   * imzasını sabit zamanlı (constant-time) ve bellek korumalı olarak doğrular.
   * * @param rawBody - İsteğin işlenmemiş ham gövdesi (Buffer)
   * @param signature - Header'dan gelen imza string'i
   * @param appSecret - İlgili servisin webhook gizli anahtarı
   */
  public static verifyWebhookSignature(
    rawBody: Buffer,
    signature: string,
    appSecret: string
  ): boolean {
    try {
      if (!signature || !appSecret) return false;

      // 1. Beklenen imzayı oluştur
      const expected = `sha256=${crypto
        .createHmac('sha256', appSecret)
        .update(rawBody)
        .digest('hex')}`;

      // 2. Bellek şişmesi (DoS) koruması
      // Gelen imza bizim ürettiğimiz imza uzunluğunda değilse belleğe almadan reddet.
      if (signature.length !== expected.length) {
        return false;
      }

      const a = Buffer.from(expected);
      const b = Buffer.from(signature);

      // 3. Zamanlama saldırısı (Timing Attack) koruması
      return crypto.timingSafeEqual(a, b);
    } catch {
      // Olası tüm beklenmedik runtime hatalarında crash etmeden güvenli şekilde reddet
      return false;
    }
  }
}

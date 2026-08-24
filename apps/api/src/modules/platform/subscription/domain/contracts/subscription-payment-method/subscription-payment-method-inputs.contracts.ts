/**
 * Kayıtlı ödeme yöntemi oluşturma girişi (entity static create). İlk ödemenin callback'inde
 * iyzico'nun döndürdüğü cardUserKey/cardToken + alıcı snapshot'ı ile doldurulur.
 *
 * Bu veri bir @shared HTTP DTO'sundan DEĞİL, doğrudan iyzico callback'inden gelir — hiçbir
 * Zod validasyon sınırından geçmez. Bu yüzden min(1) kuralları (kart/alıcı alanları boş
 * olamaz) domain katmanında SubscriptionPaymentMethod.create() içine Guard.monitor ile
 * taşındı (bkz. subscription-payment-method.entity.ts) — 3. parti entegrasyon bozuk veri
 * döndürürse yenileme tahsilatını sessizce bozan bir kayıt oluşmasın diye.
 */
export interface CreateSubscriptionPaymentMethodProps {
  id?: string;
  subscriptionId: string;
  provider?: string;
  cardUserKey: string;
  cardToken: string;
  maskedNumber?: string | null;
  cardAssociation?: string | null;
  cardFamily?: string | null;
  buyerName: string;
  buyerSurname: string;
  buyerEmail: string;
  buyerGsmNumber: string;
  buyerIp: string;
  buyerCity?: string | null;
  buyerAddress?: string | null;
}

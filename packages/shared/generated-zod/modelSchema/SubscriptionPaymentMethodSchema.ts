import { z } from 'zod';

/////////////////////////////////////////
// SUBSCRIPTION PAYMENT METHOD SCHEMA
/////////////////////////////////////////

/**
 * Kayıtlı ödeme yöntemi (kart saklama) — otomatik yenileme (recurring auto-charge) için.
 * İlk ödemede müşteri kartını saklarsa iyzico cardUserKey+cardToken üretir; yenileme günü
 * bu token'larla non-3DS payment.create çağrılır. buyer* alanları yenileme anında
 * iyzico'nun zorunlu tuttuğu alıcı bilgisini yeniden kurmak için snapshot'lanır.
 */
export const SubscriptionPaymentMethodSchema = z.object({
  id: z.string(),
  subscriptionId: z.string(),
  provider: z.string(),
  cardUserKey: z.string(),
  cardToken: z.string(),
  maskedNumber: z.string().nullable(),
  cardAssociation: z.string().nullable(),
  cardFamily: z.string().nullable(),
  buyerName: z.string(),
  buyerSurname: z.string(),
  buyerEmail: z.string(),
  buyerGsmNumber: z.string(),
  buyerIp: z.string(),
  buyerCity: z.string().nullable(),
  buyerAddress: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type SubscriptionPaymentMethod = z.infer<typeof SubscriptionPaymentMethodSchema>

export default SubscriptionPaymentMethodSchema;

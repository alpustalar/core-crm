import { z } from 'zod';

/**
 * Kaydedilmiş bir alış faturasını sonradan bir satın alma siparişine eşleştirir
 * (fatura önce girilmiş, eşleştirme sonra yapılıyor). Eşleştirmeyi kaldırmak için
 * ayrı bir uç kullanılır — gövde gerekmez.
 */
export const MatchPurchaseInvoiceSchema = z.object({
  purchaseOrderId: z.uuid(),
});

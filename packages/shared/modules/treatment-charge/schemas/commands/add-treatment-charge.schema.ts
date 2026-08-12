import { z } from 'zod';

/**
 * Randevuya fiyatlı işlem satırı ekler.
 *
 * `listPrice` GÖNDERİLMEZ — tedavinin o anki liste fiyatından okunup satıra
 * dondurulur. İstemcinin fiyat dikte etmesi indirim denetimini anlamsız kılardı;
 * satırdaki tek serbest ticari alan indirimdir ve o da klinik tavanına tabidir.
 */
export const AddTreatmentChargeSchema = z.object({
  treatmentId: z.uuid(),
  quantity: z.coerce.number().positive().default(1),
  description: z.string().max(300).nullable().optional(),

  /** İndirim yüzdesi (0–100). Klinik tavanını aşan değeri yalnız yönetici geçirebilir. */
  discountRate: z.coerce.number().min(0).max(100).default(0),
  discountReason: z.string().max(300).nullable().optional(),

  /** KDV oranı; verilmezse kliniğin geçerli sağlık KDV parametresi kullanılır. */
  vatRate: z.coerce.number().int().min(0).max(100).optional(),
});

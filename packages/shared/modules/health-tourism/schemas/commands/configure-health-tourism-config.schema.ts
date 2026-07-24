import { z } from 'zod';

/**
 * Kliniğin sağlık-turizmi (otel + transfer) config'ini oluşturur/günceller (upsert).
 * Tüm alanlar opsiyonel — yalnız gönderilenler güncellenir.
 */
export const ConfigureHealthTourismConfigSchema = z.object({
  isEnabled: z.boolean().optional(),

  // OTEL
  destinationCode: z.string().min(1).nullable().optional(),
  nearbyHotelCodes: z.array(z.string().min(1)).optional(),

  // TRANSFER
  airportIata: z.string().min(1).nullable().optional(),
  clinicLocationType: z.enum(['ATLAS', 'GPS']).nullable().optional(),
  clinicLocationCode: z.string().min(1).nullable().optional(),
  pickupAddress: z.string().min(1).nullable().optional(),

  // FİYAT — satış komisyonu (serviceFeePercent) burada YOK: platform geliridir, klinik
  // ayarlayamaz; oran platform-global env (HEALTH_TOURISM_SERVICE_FEE_PERCENT) ile uygulanır.
  defaultCurrency: z.enum(['TRY', 'USD', 'EUR', 'GBP']).optional(),
});

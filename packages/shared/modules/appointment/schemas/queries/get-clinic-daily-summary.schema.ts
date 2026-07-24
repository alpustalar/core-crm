import { z } from 'zod';

/**
 * Resepsiyon günlük özeti: verilen gün için klinik randevularının status bazlı
 * sayımları. date, klinik yerelinde gün olarak yorumlanır (gün sınırları handler'da
 * klinik saat dilimine göre hesaplanır). providerId verilirse tek doktora daralır.
 * clinicId gövdede taşınmaz — handler aktörün kliniğini kullanır.
 */
export const GetClinicDailySummarySchema = z.object({
  date: z.coerce.date(),
  providerId: z.uuid().optional(),
  clinicId: z.uuid(),
});

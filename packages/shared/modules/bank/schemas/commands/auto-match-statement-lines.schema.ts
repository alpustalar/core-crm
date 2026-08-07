import { z } from 'zod';

/**
 * Oto-eşleştirme taraması ayarları. Tutar ve yön DAİMA birebir eşleşmek
 * zorundadır (ayarı yoktur); esnetilebilen tek şey tarih toleransıdır.
 */
export const AutoMatchStatementLinesSchema = z.object({
  /**
   * Ekstre tarihi ile fiş tarihi arasında kabul edilen en fazla gün farkı.
   * 0 = yalnız aynı gün. Varsayılan 3 (valör + hafta sonu kayması).
   */
  dateToleranceDays: z.coerce.number().int().min(0).max(15).optional(),
});

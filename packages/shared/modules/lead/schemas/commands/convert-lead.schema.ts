import { z } from 'zod';

/**
 * Lead → hasta dönüşümü. Üçü de opsiyonel:
 * - patientId verilirse mevcut hasta bağlanır.
 * - verilmezse handler, lead'in telefon+isminden otomatik hasta oluşturur (idempotent).
 * - appointmentId varsa ilişkilendirilir.
 * Hiçbiri yoksa ve lead'de telefon+isim de yoksa handler hata döndürür.
 */
export const ConvertLeadSchema = z.object({
  patientId: z.uuid().optional(),
  appointmentId: z.uuid().optional(),
  clinicId: z.uuid(),
});

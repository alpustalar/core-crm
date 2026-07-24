import { z } from 'zod';

/**
 * Bir kliniğin verilen tarih aralığındaki açık (boş) randevu slotlarını sorgular.
 * providerId verilirse yalnız o doktora daraltılır; verilmezse kliniğin tüm aktif
 * doktorları taranır. slotDurationMinutes verilmezse klinik ayarındaki varsayılan
 * slot süresi kullanılır. Tarihler UTC anlarıdır (gün sınırları klinik yerelinde çözülür).
 */
export const GetClinicOpenSlotsSchema = z.object({
  clinicId: z.uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  providerId: z.uuid().optional(),
  slotDurationMinutes: z.coerce.number().int().positive().optional(),
});

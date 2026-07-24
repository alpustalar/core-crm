import { z } from 'zod';
import { AppointmentStatusSchema } from '@shared/generated-zod/inputTypeSchemas/AppointmentStatusSchema';

/**
 * Bir kliniğin verilen tarih aralığındaki TAM takvimini (tüm randevular) sorgular.
 * Sayfalama yoktur — aralıktaki her randevu döner. providerId verilirse yalnız o
 * doktora daralır; verilmezse kliniğin tüm doktorları. status verilirse yalnız o
 * durumdaki randevular (ör. gelmeyenler=NOSHOW, iptaller=CANCELLED). Tarihler UTC
 * anlarıdır; randevu başlangıç zamanına göre aralığa girer, klinik yerelinde güne
 * gruplanır.
 */
export const GetClinicCalendarSchema = z.object({
  clinicId: z.uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  providerId: z.uuid().optional(),
  status: z.enum(AppointmentStatusSchema.enum).optional(),
});

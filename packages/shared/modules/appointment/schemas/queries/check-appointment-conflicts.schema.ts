import { z } from 'zod';

/**
 * Çakışma görünürlüğü: bir doktorun verilen zaman aralığında (endTime ya da duration
 * ile) mevcut randevularıyla çakışıp çakışmadığını listeler. ENGELLEMEZ — personel
 * çakışmayı görüp yine de randevu ekleyebilir (klinik kararı). ignoreAppointmentId
 * ile ertelemede randevunun kendisi hariç tutulur.
 */
export const CheckAppointmentConflictsSchema = z
  .object({
    providerId: z.uuid({ message: 'Geçerli bir doktor seçilmelidir.' }),
    startTime: z.coerce.date(),
    endTime: z.coerce.date().optional(),
    duration: z.coerce.number().int().positive().optional(),
    ignoreAppointmentId: z.uuid().optional(),
  })
  .refine((data) => data.endTime || data.duration, {
    message: 'Bitiş zamanı veya süre belirtilmelidir.',
    path: ['endTime'],
  });

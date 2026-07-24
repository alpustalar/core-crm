import { z } from 'zod';

export const StaffRescheduleSchema = z
  .object({
    appointmentId: z.string(),
    providerId: z
      .uuid({ message: 'Geçerli bir doktor seçilmelidir.' })
      .optional(),
    startTime: z.coerce.date().refine((val) => !isNaN(val.getTime()), {
      message: 'Geçerli bir randevu tarihi giriniz.',
    }),
    endTime: z.coerce.date().optional(),
    duration: z
      .number({ error: 'Süre sayısal bir değer olmalıdır.' })
      .min(1, { message: 'Randevu süresi en az 1 dakika olmalıdır.' })
      .optional(),
    notes: z.string().optional(),
    treatmentId: z
      .uuid({ message: 'Geçerli bir tedavi seçilmelidir.' })
      .optional(),
  })
  .refine((data) => data.endTime || data.duration, {
    message: 'Bitiş zamanı veya süre belirtilmelidir.',
    path: ['endTime'],
  });

export type StaffReschedule = z.infer<typeof StaffRescheduleSchema>;
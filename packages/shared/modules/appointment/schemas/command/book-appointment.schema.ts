import { z } from 'zod';

export const BookAppointmentSchema = z
  .object({
    patientName: z
      .string()
      .min(2, { message: 'Hasta adı en az 2 karakter olmalıdır.' }),
    patientPhone: z
      .string()
      .min(7, { message: 'Geçerli bir telefon numarası giriniz.' }),
    patientEmail: z
      .email({ message: 'Geçerli bir e-posta adresi giriniz.' })
      .optional(),
    providerId: z.uuid({ message: 'Geçerli bir doktor seçilmelidir.' }),
    clinicId: z.uuid({ message: 'Geçerli bir klinik seçilmelidir.' }),
    treatmentId: z
      .uuid({ message: 'Geçerli bir tedavi seçilmelidir.' })
      .optional(),
    startTime: z.coerce
      .date()
      .refine((val) => !isNaN(val.getTime()), {
        message: 'Geçerli bir randevu tarihi giriniz.',
      })
      .refine(
        (val) => {
          const now = new Date();
          now.setMinutes(now.getMinutes() - 7);
          return val > now;
        },
        {
          message: 'Geçmiş bir tarihe randevu oluşturamazsınız.',
        }
      ),
    endTime: z.coerce
      .date()
      .refine((val) => !isNaN(val.getTime()), {
        message: 'Geçerli bir bitiş tarihi giriniz.',
      })
      .optional(), // Artık opsiyonel çünkü duration da gelebilir
    duration: z
      .number()
      .min(5, { message: 'Randevu süresi en az 5 dakika olmalıdır.' })
      .refine((val) => val % 5 === 0, {
        message: 'Randevu süresi 5 dakikanın katı olmalıdır.',
      })
      .optional(),
    notes: z.string().optional(),
    externalId: z.string().optional(),
    externalSystem: z.enum(['WHATSAPP', 'N8N', 'GOOGLE_CALENDAR']).optional(),
    isConsultation: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.endTime && !data.duration) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Randevu süresi için 'endTime' veya 'duration' alanlarından biri zorunludur.",
        path: ['endTime'],
      });
    }

    if (data.startTime && data.startTime.getUTCMinutes() % 5 !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Randevu başlangıç saati 5 dakikalık slota denk gelmelidir (örn. 09:00, 09:05, 09:10).',
        path: ['startTime'],
      });
    }

    if (data.endTime && data.endTime.getUTCMinutes() % 5 !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Randevu bitiş saati 5 dakikalık slota denk gelmelidir (örn. 09:30, 09:35, 09:40).',
        path: ['endTime'],
      });
    }

    if (data.startTime && data.endTime) {
      const diffInMinutes =
        (data.endTime.getTime() - data.startTime.getTime()) / 60000;

      if (diffInMinutes < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Bitiş zamanı, başlangıç zamanından en az 5 dakika sonra olmalıdır.',
          path: ['endTime'],
        });
      }
    }
  });

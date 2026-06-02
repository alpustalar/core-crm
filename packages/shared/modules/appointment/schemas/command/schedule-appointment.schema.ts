import { z } from "zod";

// Personel tarafından oluşturulan randevu.
// Ya mevcut hasta kaydı (patientId) ya da manuel giriş (patientName + patientPhone) zorunludur.
export const ScheduleAppointmentSchema = z
  .object({
    patientId: z.uuid({ message: "Geçerli bir hasta seçilmelidir." }).optional(),
    patientName: z
      .string()
      .min(2, { message: "Hasta adı en az 2 karakter olmalıdır." })
      .optional(),
    patientPhone: z
      .string()
      .min(7, { message: "Geçerli bir telefon numarası giriniz." })
      .optional(),
    patientEmail: z
      .string()
      .email({ message: "Geçerli bir e-posta adresi giriniz." })
      .optional(),
    providerId: z.uuid({ message: "Geçerli bir doktor seçilmelidir." }),
    treatmentId: z.uuid({ message: "Geçerli bir tedavi seçilmelidir." }).optional(),
    startTime: z.coerce.date().refine((val) => !isNaN(val.getTime()), {
      message: "Geçerli bir randevu tarihi giriniz.",
    }),
    duration: z
      .number({ error: "Süre sayısal bir değer olmalıdır." })
      .min(1, { message: "Randevu süresi en az 1 dakika olmalıdır." })
      .optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.patientId && !data.patientName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Hasta ID veya hasta adı zorunludur.",
        path: ["patientName"],
      });
    }
    if (!data.patientId && !data.patientPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Hasta ID veya telefon numarası zorunludur.",
        path: ["patientPhone"],
      });
    }
  });

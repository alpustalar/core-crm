import { z } from "zod";

export const CreateAppointmentSchema = z.object({
  patientId: z.uuid({
    message: "Geçerli bir hasta seçilmelidir (UUID formatı).",
  }),
  doctorId: z.uuid({
    message: "Geçerli bir doktor seçilmelidir (UUID formatı).",
  }),
  treatmentId: z.uuid({
    message: "Geçerli bir tedavi seçilmelidir (UUID formatı).",
  }),
  startTime: z.coerce.date().refine((val) => !isNaN(val.getTime()), {
    message: "Geçerli bir randevu tarihi giriniz.",
  }),
  duration: z
    .number({ error: "Süre sayısal bir değer olmalıdır." })
    .min(1, { message: "Randevu süresi en az 1 dakika olmalıdır." })
    .optional(),
  notes: z.string().optional(),
  clinicId: z
    .uuid({ message: "Geçerli bir klinik ID girilmelidir." })
    .optional(),
  externalId: z.string().optional(),
});

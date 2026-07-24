import { z } from 'zod';
import { ExaminationTypeSchema } from '@shared/generated-zod/inputTypeSchemas/ExaminationTypeSchema';
import { VisitTypeSchema } from '@shared/generated-zod/inputTypeSchemas/VisitTypeSchema';

/**
 * Personel (resepsiyon) tarafından randevu detaylarının düzenlenmesi. Yalnız
 * "içerik" alanları — zaman/doktor DEĞİL (o reschedule'a aittir), durum DEĞİL
 * (confirm/cancel/no-show ayrı). Verilmeyen alanlar dokunulmadan bırakılır;
 * null gönderilen nullable alanlar temizlenir.
 */
export const UpdateAppointmentDetailsSchema = z.object({
  patientName: z
    .string()
    .min(2, { message: 'Hasta adı en az 2 karakter olmalıdır.' })
    .optional(),
  patientPhone: z
    .string()
    .min(7, { message: 'Geçerli bir telefon numarası giriniz.' })
    .optional(),
  patientEmail: z
    .email({ message: 'Geçerli bir e-posta adresi giriniz.' })
    .nullable()
    .optional(),
  notes: z.string().max(2000).nullable().optional(),
  treatmentType: z.string().max(255).nullable().optional(),
  treatmentId: z
    .uuid({ message: 'Geçerli bir tedavi seçilmelidir.' })
    .nullable()
    .optional(),
  examinationType: ExaminationTypeSchema.nullable().optional(),
  visitType: VisitTypeSchema.nullable().optional(),
});

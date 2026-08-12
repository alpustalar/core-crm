import { z } from 'zod';

/** Randevunun işlem satırlarını listeler; iptal edilenler istenirse dahil edilir. */
export const GetAppointmentChargesSchema = z.object({
  includeVoided: z.coerce.boolean().default(false),
});

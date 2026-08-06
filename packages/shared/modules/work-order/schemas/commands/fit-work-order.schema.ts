import { z } from 'zod';

/** Hastaya uygulandı (terminal). Uygulandığı randevu opsiyonel olarak işaretlenir. */
export const FitWorkOrderSchema = z.object({
  appointmentId: z.uuid().nullable().optional(),
});

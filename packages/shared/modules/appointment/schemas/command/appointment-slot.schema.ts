import { z } from 'zod';

/**
 * Randevu slotu kimliği — doktor + başlangıç anı. Slotu geçici kilitleme (hold) ve
 * kilidi serbest bırakma uçları bu payload'ı kullanır.
 */
export const AppointmentSlotSchema = z.object({
  providerId: z.uuid({ message: 'Geçerli bir doktor seçilmelidir.' }),
  startTime: z.coerce.date(),
});

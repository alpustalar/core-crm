import { z } from 'zod';

/** Aktivite güncelleme — yalnız gönderilen alanlar değişir. Status complete/delete ile yönetilir. */
export const UpdateActivitySchema = z.object({
  subject: z.string().min(1).optional(),
  notes: z.string().nullable().optional(),
  assignedToId: z.string().uuid().nullable().optional(),
  dueAt: z.coerce.date().nullable().optional(),
});

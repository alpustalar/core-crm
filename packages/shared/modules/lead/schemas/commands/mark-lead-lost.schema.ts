import { z } from 'zod';

export const MarkLeadLostSchema = z.object({
  lostReason: z.string().min(1).optional(),
  clinicId: z.string(),
});

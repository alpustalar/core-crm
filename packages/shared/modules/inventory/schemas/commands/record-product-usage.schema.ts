import { z } from 'zod';

export const RecordProductUsageSchema = z.object({
  productId: z.string().uuid(),
  batchId: z.string().uuid().optional().nullable(),
  appointmentId: z.string().uuid().optional().nullable(),
  quantity: z.number().positive(),
  notes: z.string().max(1000).optional().nullable(),
});

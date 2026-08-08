import { z } from 'zod';

export const CancelWorkOrderSchema = z.object({
  reason: z.string().min(1),
});

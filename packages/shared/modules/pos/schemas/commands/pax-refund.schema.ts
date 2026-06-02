import { z } from 'zod';

export const PaxRefundSchema = z.object({
  originalPosTransactionId: z.string().uuid(),
  clinicId: z.string().uuid(),
  amount: z.number().positive().optional(),
});

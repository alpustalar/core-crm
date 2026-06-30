import { z } from 'zod';

export const IyzicoTerminalRefundSchema = z.object({
  originalPosTransactionId: z.uuid(),
  clinicId: z.uuid(),
  amount: z.number().positive().optional(),
});

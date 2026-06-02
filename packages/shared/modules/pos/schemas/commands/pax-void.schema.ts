import { z } from 'zod';

export const PaxVoidSchema = z.object({
  originalPosTransactionId: z.string().uuid(),
  clinicId: z.string().uuid(),
});

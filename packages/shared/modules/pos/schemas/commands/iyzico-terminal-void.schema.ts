import { z } from 'zod';

export const IyzicoTerminalVoidSchema = z.object({
  originalPosTransactionId: z.uuid(),
  clinicId: z.uuid(),
});

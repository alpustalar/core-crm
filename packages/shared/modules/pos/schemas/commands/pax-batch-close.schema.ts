import { z } from 'zod';

export const PaxBatchCloseSchema = z.object({
  clinicId: z.string().uuid(),
});

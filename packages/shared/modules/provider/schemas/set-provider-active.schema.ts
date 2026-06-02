import { z } from 'zod';

export const SetProviderActiveSchema = z.object({
  isActive: z.coerce.boolean(),
});

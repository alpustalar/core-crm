import { z } from 'zod';

export const UpdateLeadStatusSchema = z.object({
  status: z.enum(['CONTACTED', 'QUALIFIED']),
  notes: z.string().optional(),
});

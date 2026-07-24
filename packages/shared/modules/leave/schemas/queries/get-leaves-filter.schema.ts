import { z } from 'zod';

export const GetLeavesFilterSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
});

export type GetLeavesFilter = z.infer<typeof GetLeavesFilterSchema>;
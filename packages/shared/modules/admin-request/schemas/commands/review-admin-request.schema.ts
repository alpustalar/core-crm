import { z } from 'zod';

export const ReviewAdminRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewNote: z.string().min(1).optional(),
});

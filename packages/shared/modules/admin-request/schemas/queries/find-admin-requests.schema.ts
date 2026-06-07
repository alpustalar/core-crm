import { z } from 'zod';

export const FindAdminRequestsSchema = z.object({
  type: z.enum(['CLINIC_DELETION', 'ORGANIZATION_DELETION']).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

import { z } from 'zod';

export const FindPatientPackagesSchema = z.object({
  patientId: z.uuid().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED', 'SUSPENDED']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

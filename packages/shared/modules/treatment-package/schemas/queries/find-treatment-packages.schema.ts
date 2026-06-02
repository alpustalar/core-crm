import { z } from 'zod';

export const FindTreatmentPackagesSchema = z.object({
  clinicId: z.uuid().optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

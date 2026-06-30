import { z } from 'zod';
import { PaginationSchema } from '@shared/common/pagination/pagination.schema';

export const FindTreatmentPackagesSchema = z.object({
  clinicId: z.uuid().optional(),
  isActive: z.boolean().optional(),
  pagination: PaginationSchema,
});

import { z } from 'zod';
import { PaginationSchema } from '@shared/common/pagination/pagination.schema';

export const GetTransferBookingsSchema = z.object({
  clinicId: z.uuid().optional(),
  patientId: z.uuid().optional(),
  leadId: z.uuid().optional(),
  pagination: PaginationSchema,
});

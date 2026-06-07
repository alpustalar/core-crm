import { z } from 'zod';

export const GetTransferBookingsSchema = z.object({
  clinicId: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

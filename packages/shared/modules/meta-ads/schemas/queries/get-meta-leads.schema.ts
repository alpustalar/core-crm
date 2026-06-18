import { z } from 'zod';

export const MetaLeadStatusSchema = z.enum([
  'NEW',
  'MATCHED',
  'CONVERTED',
  'INVALID',
]);

export const GetMetaLeadsSchema = z.object({
  clinicId: z.uuid(),
  status: MetaLeadStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

import { z } from 'zod';

export const GetMetaReportSchema = z.object({
  clinicId: z.string().uuid(),
  from: z.coerce.date(),
  to: z.coerce.date(),
  campaignId: z.string().optional(),
});

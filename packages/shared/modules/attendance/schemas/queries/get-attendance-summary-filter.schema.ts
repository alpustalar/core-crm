import { z } from 'zod';

export const GetAttendanceSummaryFilterSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

import { z } from 'zod';

export const GetAttendanceFilterSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type GetAttendanceFilter = z.infer<typeof GetAttendanceFilterSchema>;

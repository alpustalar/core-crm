import { z } from 'zod';
import { GetAttendanceSummaryFilterSchema } from '../../schemas/queries';

export type GetAttendanceSummaryFilter = z.infer<typeof GetAttendanceSummaryFilterSchema>;

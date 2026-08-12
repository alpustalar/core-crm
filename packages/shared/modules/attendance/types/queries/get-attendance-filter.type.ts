import { z } from 'zod';
import { GetAttendanceFilterSchema } from '../../schemas/queries';

export type GetAttendanceFilter = z.infer<typeof GetAttendanceFilterSchema>;

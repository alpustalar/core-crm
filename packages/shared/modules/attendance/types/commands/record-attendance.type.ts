import { z } from 'zod';
import { RecordAttendanceSchema } from '../../schemas/commands';

export type RecordAttendance = z.infer<typeof RecordAttendanceSchema>;

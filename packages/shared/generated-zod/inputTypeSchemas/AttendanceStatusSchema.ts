import { z } from 'zod';

export const AttendanceStatusSchema = z.enum(['OPEN','CLOSED']);

export type AttendanceStatusType = `${z.infer<typeof AttendanceStatusSchema>}`

export default AttendanceStatusSchema;

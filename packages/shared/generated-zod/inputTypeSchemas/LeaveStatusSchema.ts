import { z } from 'zod';

export const LeaveStatusSchema = z.enum(['PENDING','APPROVED','REJECTED','CANCELLED']);

export type LeaveStatusType = `${z.infer<typeof LeaveStatusSchema>}`

export default LeaveStatusSchema;

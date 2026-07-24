import { z } from 'zod';

export const LeaveTypeSchema = z.enum(['ANNUAL','SICK','UNPAID','MATERNITY','BEREAVEMENT','OTHER']);

export type LeaveTypeType = `${z.infer<typeof LeaveTypeSchema>}`

export default LeaveTypeSchema;

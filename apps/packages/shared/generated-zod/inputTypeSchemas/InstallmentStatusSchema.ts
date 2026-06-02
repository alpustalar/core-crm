import { z } from 'zod';

export const InstallmentStatusSchema = z.enum(['PENDING','COMPLETED','OVERDUE','CANCELLED','REFUNDED']);

export type InstallmentStatusType = `${z.infer<typeof InstallmentStatusSchema>}`

export default InstallmentStatusSchema;

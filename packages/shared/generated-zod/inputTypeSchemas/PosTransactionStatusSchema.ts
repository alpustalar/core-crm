import { z } from 'zod';

export const PosTransactionStatusSchema = z.enum(['PENDING','SUCCESS','FAILED','CANCELLED','TIMEOUT']);

export type PosTransactionStatusType = `${z.infer<typeof PosTransactionStatusSchema>}`

export default PosTransactionStatusSchema;

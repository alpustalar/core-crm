import { z } from 'zod';

export const IyzicoTransactionStatusSchema = z.enum(['INITIALIZE','SUCCESS','FAILURE','REFUNDED']);

export type IyzicoTransactionStatusType = `${z.infer<typeof IyzicoTransactionStatusSchema>}`

export default IyzicoTransactionStatusSchema;

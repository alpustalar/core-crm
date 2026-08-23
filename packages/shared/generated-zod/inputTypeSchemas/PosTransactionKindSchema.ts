import { z } from 'zod';

export const PosTransactionKindSchema = z.enum(['SALE','VOID','REFUND']);

export type PosTransactionKindType = `${z.infer<typeof PosTransactionKindSchema>}`

export default PosTransactionKindSchema;

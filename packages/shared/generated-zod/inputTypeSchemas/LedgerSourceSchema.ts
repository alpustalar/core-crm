import { z } from 'zod';

export const LedgerSourceSchema = z.enum(['IYZICO','STRIPE','CASH','BANK_TRANSFER']);

export type LedgerSourceType = `${z.infer<typeof LedgerSourceSchema>}`

export default LedgerSourceSchema;

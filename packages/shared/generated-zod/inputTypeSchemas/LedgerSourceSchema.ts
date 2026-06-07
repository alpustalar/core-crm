import { z } from 'zod';

export const LedgerSourceSchema = z.enum(['PAYMENT_MODULE','INVENTORY_MODULE','MANUAL_ENTRY']);

export type LedgerSourceType = `${z.infer<typeof LedgerSourceSchema>}`

export default LedgerSourceSchema;

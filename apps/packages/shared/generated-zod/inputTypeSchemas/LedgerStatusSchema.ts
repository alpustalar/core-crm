import { z } from 'zod';

export const LedgerStatusSchema = z.enum(['COMPLETED','CANCELLED','REFUNDED']);

export type LedgerStatusType = `${z.infer<typeof LedgerStatusSchema>}`

export default LedgerStatusSchema;

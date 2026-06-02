import { z } from 'zod';

export const LedgerTypeSchema = z.enum(['INCOME','EXPENSE']);

export type LedgerTypeType = `${z.infer<typeof LedgerTypeSchema>}`

export default LedgerTypeSchema;

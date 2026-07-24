import { z } from 'zod';

export const BankStatementLineMatchStatusSchema = z.enum(['UNMATCHED','MATCHED','IGNORED']);

export type BankStatementLineMatchStatusType = `${z.infer<typeof BankStatementLineMatchStatusSchema>}`

export default BankStatementLineMatchStatusSchema;

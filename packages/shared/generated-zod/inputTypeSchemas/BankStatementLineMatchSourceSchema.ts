import { z } from 'zod';

export const BankStatementLineMatchSourceSchema = z.enum(['MANUAL','AUTO']);

export type BankStatementLineMatchSourceType = `${z.infer<typeof BankStatementLineMatchSourceSchema>}`

export default BankStatementLineMatchSourceSchema;

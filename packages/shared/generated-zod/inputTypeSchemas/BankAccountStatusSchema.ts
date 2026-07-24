import { z } from 'zod';

export const BankAccountStatusSchema = z.enum(['ACTIVE','ARCHIVED']);

export type BankAccountStatusType = `${z.infer<typeof BankAccountStatusSchema>}`

export default BankAccountStatusSchema;

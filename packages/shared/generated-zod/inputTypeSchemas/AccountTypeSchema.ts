import { z } from 'zod';

export const AccountTypeSchema = z.enum(['ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE']);

export type AccountTypeType = `${z.infer<typeof AccountTypeSchema>}`

export default AccountTypeSchema;

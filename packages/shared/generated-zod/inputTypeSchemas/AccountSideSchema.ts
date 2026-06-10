import { z } from 'zod';

export const AccountSideSchema = z.enum(['DEBIT','CREDIT']);

export type AccountSideType = `${z.infer<typeof AccountSideSchema>}`

export default AccountSideSchema;

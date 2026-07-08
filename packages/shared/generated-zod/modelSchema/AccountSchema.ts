import { z } from 'zod';
import { AccountTypeSchema } from '../inputTypeSchemas/AccountTypeSchema'
import { AccountSideSchema } from '../inputTypeSchemas/AccountSideSchema'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// ACCOUNT SCHEMA
/////////////////////////////////////////

export const AccountSchema = z.object({
  type: AccountTypeSchema,
  normalSide: AccountSideSchema,
  currency: CurrencySchema.nullable(),
  id: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  parentId: z.string().nullable(),
  code: z.string(),
  name: z.string(),
  isPostable: z.boolean(),
  requiresParty: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Account = z.infer<typeof AccountSchema>

export default AccountSchema;

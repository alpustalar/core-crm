import { z } from 'zod';
import { AccountingPeriodStatusSchema } from '../inputTypeSchemas/AccountingPeriodStatusSchema'

/////////////////////////////////////////
// ACCOUNTING PERIOD SCHEMA
/////////////////////////////////////////

export const AccountingPeriodSchema = z.object({
  status: AccountingPeriodStatusSchema,
  id: z.uuid(),
  clinicId: z.string(),
  organizationId: z.string(),
  year: z.number().int(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type AccountingPeriod = z.infer<typeof AccountingPeriodSchema>

export default AccountingPeriodSchema;

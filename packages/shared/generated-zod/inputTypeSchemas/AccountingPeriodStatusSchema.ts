import { z } from 'zod';

export const AccountingPeriodStatusSchema = z.enum(['OPEN','LOCKED','CLOSED']);

export type AccountingPeriodStatusType = `${z.infer<typeof AccountingPeriodStatusSchema>}`

export default AccountingPeriodStatusSchema;

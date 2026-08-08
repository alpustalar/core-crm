import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';

/////////////////////////////////////////
// BANK STATEMENT SCHEMA
/////////////////////////////////////////

export const BankStatementSchema = z.object({
  id: z.string(),
  bankAccountId: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  openingBalance: decimalSchema("Field 'openingBalance' must be a Decimal. Location: ['Models', 'BankStatement']").nullable(),
  closingBalance: decimalSchema("Field 'closingBalance' must be a Decimal. Location: ['Models', 'BankStatement']").nullable(),
  fileName: z.string().nullable(),
  importedById: z.string(),
  createdAt: z.coerce.date(),
})

export type BankStatement = z.infer<typeof BankStatementSchema>

export default BankStatementSchema;

import { z } from 'zod';
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'
import { CashRegisterStatusSchema } from '../inputTypeSchemas/CashRegisterStatusSchema'

/////////////////////////////////////////
// CASH REGISTER SCHEMA
/////////////////////////////////////////

export const CashRegisterSchema = z.object({
  currency: CurrencySchema,
  status: CashRegisterStatusSchema,
  id: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CashRegister = z.infer<typeof CashRegisterSchema>

export default CashRegisterSchema;

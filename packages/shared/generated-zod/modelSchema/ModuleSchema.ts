import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// MODULE SCHEMA
/////////////////////////////////////////

export const ModuleSchema = z.object({
  currency: CurrencySchema,
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  monthlyPrice: decimalSchema("Field 'monthlyPrice' must be a Decimal. Location: ['Models', 'Module']"),
  isActive: z.boolean(),
})

export type Module = z.infer<typeof ModuleSchema>

export default ModuleSchema;

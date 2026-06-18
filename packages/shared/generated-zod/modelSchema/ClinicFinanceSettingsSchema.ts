import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// CLINIC FINANCE SETTINGS SCHEMA
/////////////////////////////////////////

export const ClinicFinanceSettingsSchema = z.object({
  defaultCurrency: CurrencySchema,
  id: z.uuid(),
  autoCreateInvoice: z.boolean(),
  defaultVatRate: z.instanceof(Prisma.Decimal, { message: "Field 'defaultVatRate' must be a Decimal. Location: ['Models', 'ClinicFinanceSettings']"}),
  useCostTracking: z.boolean(),
  allowNegativeBalance: z.boolean(),
  maxInstallmentCount: z.number().int(),
  fiscalYearStartMonth: z.number().int(),
  clinicId: z.string(),
  updatedAt: z.coerce.date(),
})

export type ClinicFinanceSettings = z.infer<typeof ClinicFinanceSettingsSchema>

export default ClinicFinanceSettingsSchema;

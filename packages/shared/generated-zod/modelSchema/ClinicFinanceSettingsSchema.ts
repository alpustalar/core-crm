import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'
import { RoundingDirectionSchema } from '../inputTypeSchemas/RoundingDirectionSchema'
import { PayoutTriggerSchema } from '../inputTypeSchemas/PayoutTriggerSchema'

/////////////////////////////////////////
// CLINIC FINANCE SETTINGS SCHEMA
/////////////////////////////////////////

export const ClinicFinanceSettingsSchema = z.object({
  defaultCurrency: CurrencySchema,
  roundingType: RoundingDirectionSchema,
  providerPayoutTrigger: PayoutTriggerSchema,
  id: z.string(),
  clinicId: z.string(),
  invoicePrefix: z.string(),
  autoCreateInvoice: z.boolean(),
  autoSendDebtReminder: z.boolean(),
  defaultVatRate: z.instanceof(Prisma.Decimal, { message: "Field 'defaultVatRate' must be a Decimal. Location: ['Models', 'ClinicFinanceSettings']"}),
  useCostTracking: z.boolean(),
  allowNegativeBalance: z.boolean(),
  maxNegativeBalanceAmount: z.instanceof(Prisma.Decimal, { message: "Field 'maxNegativeBalanceAmount' must be a Decimal. Location: ['Models', 'ClinicFinanceSettings']"}),
  maxInstallmentCount: z.number().int(),
  isEInvoiceActive: z.boolean(),
  fiscalYearStartMonth: z.number().int(),
  updatedAt: z.coerce.date(),
})

export type ClinicFinanceSettings = z.infer<typeof ClinicFinanceSettingsSchema>

export default ClinicFinanceSettingsSchema;

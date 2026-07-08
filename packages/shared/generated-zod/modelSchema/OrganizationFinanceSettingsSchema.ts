import { z } from 'zod';
import { BillingTargetSchema } from '../inputTypeSchemas/BillingTargetSchema'

/////////////////////////////////////////
// ORGANIZATION FINANCE SETTINGS SCHEMA
/////////////////////////////////////////

/**
 * Organizasyonun finansal davranış ayarları (1:1 satellite) — ClinicFinanceSettings'in org-seviye
 * karşılığı. `subscriptionBillingTarget` platform aboneliğinin org'a mı yoksa her kliniğe mi
 * faturalanacağını belirler (franchise). İleride billing contact/VKN/currency için genişler.
 */
export const OrganizationFinanceSettingsSchema = z.object({
  subscriptionBillingTarget: BillingTargetSchema,
  id: z.string(),
  organizationId: z.string(),
  updatedAt: z.coerce.date(),
})

export type OrganizationFinanceSettings = z.infer<typeof OrganizationFinanceSettingsSchema>

export default OrganizationFinanceSettingsSchema;

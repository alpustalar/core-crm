import { z } from 'zod';
import { BillingTargetSchema } from '@input-type-schemas/BillingTargetSchema';

// ==========================================
// ORGANİZASYON FİNANS AYARLARI (SATELLITE) SÖZLEŞMESİ
// ==========================================
// 1:1 Organization satellite — ClinicFinanceSettings'in org-seviye karşılığı.
// `subscriptionBillingTarget` platform aboneliğinin org'a mı yoksa her kliniğe mi
// faturalanacağını belirler. Satır yoksa DB default'u (ORGANIZATION) geçerlidir.

export const CreateOrganizationFinanceSettingsPropsSchema = z.object({
  id: z.uuid().optional(),
  organizationId: z.uuid('Organizasyon ID zorunludur'),
  subscriptionBillingTarget: BillingTargetSchema.optional(),
});

export type CreateOrganizationFinanceSettingsProps = z.infer<
  typeof CreateOrganizationFinanceSettingsPropsSchema
>;

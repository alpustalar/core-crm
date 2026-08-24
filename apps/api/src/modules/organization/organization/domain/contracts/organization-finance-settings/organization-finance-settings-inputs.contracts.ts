import { BillingTargetType as BillingTarget } from '@input-type-schemas/BillingTargetSchema';

// ==========================================
// ORGANİZASYON FİNANS AYARLARI (SATELLITE) SÖZLEŞMESİ
// ==========================================
// 1:1 Organization satellite — ClinicFinanceSettings'in org-seviye karşılığı.
// `subscriptionBillingTarget` platform aboneliğinin org'a mı yoksa her kliniğe mi
// faturalanacağını belirler. Satır yoksa DB default'u (ORGANIZATION) geçerlidir.

export interface CreateOrganizationFinanceSettingsProps {
  id?: string;
  organizationId: string; // Organizasyon ID zorunludur
  subscriptionBillingTarget?: BillingTarget;
}

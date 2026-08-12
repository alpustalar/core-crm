import { z } from 'zod';
import { Decimal } from 'decimal.js';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { RoundingDirectionSchema } from '@input-type-schemas/RoundingDirectionSchema';
import { PayoutTriggerSchema } from '@input-type-schemas/PayoutTriggerSchema';

// ==========================================
// KLİNİK FİNANS AYARLARI (SATELLITE) SÖZLEŞMESİ
// ==========================================
// 1:1 Clinic satellite — fonksiyonel para birimi, KDV, taksit ve mali yıl
// gibi şube-bazlı finansal davranış ayarlarını taşır. Satır yoksa DB default'ları
// (TRY, %20 KDV vb.) geçerli kabul edilir.

export const CreateClinicFinanceSettingsPropsSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid('Klinik ID zorunludur'),

  defaultCurrency: CurrencySchema.optional(),
  roundingType: RoundingDirectionSchema.optional(),
  providerPayoutTrigger: PayoutTriggerSchema.optional(),
  invoicePrefix: z.string().optional(),
  autoCreateInvoice: z.boolean().optional(),
  autoSendDebtReminder: z.boolean().optional(),
  defaultVatRate: z.instanceof(Decimal).optional(),
  useCostTracking: z.boolean().optional(),
  allowNegativeBalance: z.boolean().optional(),
  maxNegativeBalanceAmount: z.instanceof(Decimal).optional(),
  maxInstallmentCount: z.number().int().positive().optional(),
  maxDiscountPercent: z.instanceof(Decimal).optional(),
  isEInvoiceActive: z.boolean().optional(),
  fiscalYearStartMonth: z.number().int().min(1).max(12).optional(),
});

export type CreateClinicFinanceSettingsProps = z.infer<
  typeof CreateClinicFinanceSettingsPropsSchema
>;

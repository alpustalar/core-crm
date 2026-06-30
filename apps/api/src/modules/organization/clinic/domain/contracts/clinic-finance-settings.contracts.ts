import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';

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
  autoCreateInvoice: z.boolean().optional(),
  defaultVatRate: z.instanceof(Prisma.Decimal).optional(),
  useCostTracking: z.boolean().optional(),
  allowNegativeBalance: z.boolean().optional(),
  maxInstallmentCount: z.number().int().positive().optional(),
  fiscalYearStartMonth: z.number().int().min(1).max(12).optional(),
});

export type CreateClinicFinanceSettingsProps = z.infer<
  typeof CreateClinicFinanceSettingsPropsSchema
>;

import { z } from 'zod';
import { LedgerSourceSchema } from '@input-type-schemas/LedgerSourceSchema';
import { LedgerTypeSchema } from '@input-type-schemas/LedgerTypeSchema';
import { LedgerCategorySchema } from '@input-type-schemas/LedgerCategorySchema';
import { Money } from '@src/domain/value-objects/money.vo';

// ==========================================
// (DEFTER HAREKETİ) SÖZLEŞMELERİ
// ==========================================

export const CreateFinanceLedgerSchema = z.object({
  id: z.uuid().optional(),
  organizationId: z.uuid(),
  clinicId: z.uuid(),
  patientId: z.uuid().nullable().optional(),
  paymentId: z.uuid().nullable().optional(),
  installmentId: z.uuid().nullable().optional(),
  performedById: z.uuid().nullable().optional(),

  type: LedgerTypeSchema, // Örn: DEBIT / CREDIT
  source: LedgerSourceSchema, // Örn: PATIENT_PAYMENT, INVOICE
  category: LedgerCategorySchema, // Örn: TREATMENT, INVENTORY

  money: z.custom<Money>((val) => val instanceof Money),

  taxRate: z.number().optional(),
  description: z.string().optional(),
  documentNo: z.string().optional(),
  entryDate: z.date().optional(),
});

export type CreateFinanceLedgerProps = z.infer<
  typeof CreateFinanceLedgerSchema
>;

// 1. Patient Finance Summary Şeması
export const PatientFinanceSummarySchema = z.object({
  balance: z.string(),
  totalServiceAmount: z.string(),
  totalPayments: z.string(),
});

// 2. Patient Ledger Item Şeması
export const PatientLedgerItemSchema = z.object({
  id: z.uuid('Geçerli bir cari hareket ID olmalıdır'),
  amount: z.string(),
  category: z.string(), // veya LedgerCategorySchema
  entryDate: z.date(),
  status: z.string(), // veya LedgerStatusSchema
  description: z.string().nullable(),
  paymentMethod: z.string().nullable(), // veya PaymentMethodSchema.nullable()
  providerName: z.string().nullable(),
});

// 3. Patient Revenue Şeması (ROI / Attribution için)
export const PatientRevenueSchema = z.object({
  patientId: z.uuid('Geçerli bir hasta ID olmalıdır'),
  revenue: z.string(),
});

// 4. Sum Income By Patients Filter Şeması (Tarih ve ID aralığı doğrulama)
export const SumIncomeByPatientsFilterSchema = z
  .object({
    patientIds: z
      .array(z.uuid('Geçerli bir hasta ID olmalıdır'))
      .min(1, 'En az bir hasta ID seçilmelidir'),
    from: z.date(),
    to: z.date(),
  })
  .refine((data) => data.to >= data.from, {
    message: 'Bitiş tarihi, başlangıç tarihinden küçük olamaz',
    path: ['to'],
  });

// 1. Ledger Summary Şeması
// Finansal özet döndürürken veri tipini korumak için Zod şeması
export const LedgerSummarySchema = z.object({
  totalIncome: z.string(),
  totalExpenses: z.string(),
  balance: z.string(),
  entryCount: z.number().int().nonnegative('İşlem sayısı negatif olamaz'),
});

// 2. Summary Filtre Şeması
export const GetSummaryFilterSchema = z
  .object({
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
  })
  .refine(
    (data) => {
      // Eğer her iki tarih de girilmişse, mantıksal kontrol yap
      if (data.dateFrom && data.dateTo) {
        return data.dateTo >= data.dateFrom;
      }
      return true;
    },
    {
      message: 'Bitiş tarihi, başlangıç tarihinden önce olamaz',
      path: ['dateTo'],
    }
  );

export type LedgerSummary = z.infer<typeof LedgerSummarySchema>;
export type GetSummaryFilter = z.infer<typeof GetSummaryFilterSchema>;
export type PatientFinanceSummary = z.infer<typeof PatientFinanceSummarySchema>;
export type PatientLedgerItem = z.infer<typeof PatientLedgerItemSchema>;
export type PatientRevenue = z.infer<typeof PatientRevenueSchema>;
export type SumIncomeByPatientsFilter = z.infer<
  typeof SumIncomeByPatientsFilterSchema
>;

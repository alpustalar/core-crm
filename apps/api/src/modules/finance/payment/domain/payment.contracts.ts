import { z } from 'zod';
import { Decimal } from 'decimal.js';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { PaymentMethodSchema } from '@input-type-schemas/PaymentMethodSchema';
import { Money } from '@src/domain/value-objects/money.vo';
import { InstallmentPlanItem } from '@modules/finance/payment/domain/repositories/payment.repository.interface';

// ==========================================
// 1. YAŞLANDIRMA & RAPORLAMA SÖZLEŞMELERİ (AGING & REVENUE)
// ==========================================

export const ArAgingFilterSchema = z.object({
  clinicId: z.uuid(),
});
export type ArAgingFilter = z.infer<typeof ArAgingFilterSchema>;

export const OpenInstallmentRowSchema = z.object({
  patientId: z.uuid(),
  amount: z.custom<Decimal>((val) => val instanceof Decimal),
  dueDate: z.date().nullable(),
});
export type OpenInstallmentRow = z.infer<typeof OpenInstallmentRowSchema>;

export const ArAgingDataSchema = z.object({
  openInstallments: z.array(OpenInstallmentRowSchema),
  collectedTotal: z.custom<Decimal>((val) => val instanceof Decimal),
});
export type ArAgingData = z.infer<typeof ArAgingDataSchema>;

export const CollectedInstallmentRowSchema = z.object({
  providerId: z.uuid().nullable(), // Atanmamış hekimler için null desteği
  amount: z.custom<Decimal>((val) => val instanceof Decimal),
});
export type CollectedInstallmentRow = z.infer<
  typeof CollectedInstallmentRowSchema
>;

export const ProviderRevenueFilterDataSchema = z.object({
  clinicId: z.uuid(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});
export type ProviderRevenueFilterData = z.infer<
  typeof ProviderRevenueFilterDataSchema
>;

// ==========================================
// 2. TAKSİTLENDİRME VE PLANLAMA SÖZLEŞMELERİ (INSTALLMENTS)
// ==========================================

export const CreateInstallmentPlanInputSchema = z.object({
  clinicId: z.uuid(),
  patientId: z.uuid(),
  appointmentId: z.uuid().optional(),
  providerId: z.uuid().optional(),
  currency: CurrencySchema,
  // Repo seviyesindeki ham arayüz tipi için custom sarmalayıcı:
  installments: z.array(
    z.custom<InstallmentPlanItem>(
      (val) => val !== null && typeof val === 'object'
    )
  ),
});
export type CreateInstallmentPlanInput = z.infer<
  typeof CreateInstallmentPlanInputSchema
>;

export const CreateInstallmentPropsSchema = z.object({
  id: z.uuid(),
  installmentNo: z.number().int().positive(),
  money: z.custom<Money>((val) => val instanceof Money), // CLAUDE.md: Money VO koruması
  method: PaymentMethodSchema.optional(),
  dueDate: z.date().nullable().optional(),
  note: z.string().nullable().optional(),
});
export type CreateInstallmentProps = z.infer<
  typeof CreateInstallmentPropsSchema
>;

export const InstallmentOptionSchema = z.object({
  installmentNumber: z.number().int().positive(),
  totalPrice: z.number(),
  installmentPrice: z.number(),
  installmentRate: z.number(),
});
export type InstallmentOption = z.infer<typeof InstallmentOptionSchema>;

// ==========================================
// 3. ÖDEME VE TAHSİLAT SÖZLEŞMELERİ (PAYMENTS)
// ==========================================

export const CreatePaymentPropsSchema = z.object({
  id: z.uuid(),
  clinicId: z.uuid(),
  patientId: z.uuid(),
  appointmentId: z.uuid().nullable().optional(),
  providerId: z.uuid().nullable().optional(),
  totalAmount: z.custom<Money>((val) => val instanceof Money), // CLAUDE.md: Money VO koruması

  // Orijinal interface'e uygun olarak düzeltilen taksit dizisi:
  installments: z
    .array(CreateInstallmentPropsSchema)
    .min(1, 'Ödeme için en az bir taksit kırılımı veya peşinat olmalıdır'),
});

export type CreatePaymentProps = z.infer<typeof CreatePaymentPropsSchema>;

export const CreateSinglePaymentDataSchema = z.object({
  clinicId: z.uuid(),
  patientId: z.uuid(),
  appointmentId: z.uuid().optional(),
  providerId: z.uuid().optional(),
  amount: z.number().positive(),
  currency: CurrencySchema,
  method: PaymentMethodSchema.optional(),
  dueDate: z.date().optional(),
});
export type CreateSinglePaymentData = z.infer<
  typeof CreateSinglePaymentDataSchema
>;

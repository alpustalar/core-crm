import { z } from 'zod';
import { Decimal } from 'decimal.js';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { CashRegisterStatusSchema } from '@input-type-schemas/CashRegisterStatusSchema';
import { CashSessionStatusSchema } from '@input-type-schemas/CashSessionStatusSchema';
import { CashMovementTypeSchema } from '@input-type-schemas/CashMovementTypeSchema';
import { Pagination } from '@shared/common';
import { CashSession as ICashSession } from '@model-schema/CashSessionSchema';
import { CashMovement as ICashMovement } from '@model-schema/CashMovementSchema';

// ==========================================
// KASA (CASH REGISTER) — Props
// clinicId/organizationId bağlamdan (actor) gelir.
// ==========================================

export const CreateCashRegisterSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  name: z.string().min(1),
  currency: CurrencySchema.optional(),
});
export type CreateCashRegisterProps = z.infer<typeof CreateCashRegisterSchema>;

// ==========================================
// KASA OTURUMU (CASH SESSION) — Aç Props
// ==========================================

export const OpenCashSessionSchema = z.object({
  id: z.uuid().optional(),
  cashRegisterId: z.uuid(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  currency: CurrencySchema,
  openingFloat: z.number().nonnegative(),
  openedById: z.uuid(),
  note: z.string().nullable().optional(),
});
export type OpenCashSessionProps = z.infer<typeof OpenCashSessionSchema>;

/**
 * Oturum kapatma girişi (domain metodu) — expected, openingFloat + net hareketten
 * entity içinde hesaplanır; handler repo SUM'undan totalIn/totalOut'u besler.
 */
export interface CloseCashSessionInput {
  totalIn: Decimal;
  totalOut: Decimal;
  countedAmount: Decimal;
  closedById: string;
}

// ==========================================
// KASA HAREKETİ (CASH MOVEMENT) — Props
// ==========================================

export const RecordCashMovementSchema = z.object({
  id: z.uuid().optional(),
  cashSessionId: z.uuid(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  type: CashMovementTypeSchema,
  amount: z.number().positive(),
  currency: CurrencySchema,
  description: z.string().nullable().optional(),
  referenceType: z.string().nullable().optional(),
  referenceId: z.string().nullable().optional(),
  performedById: z.uuid(),
});
export type RecordCashMovementProps = z.infer<typeof RecordCashMovementSchema>;

// ==========================================
// Read-model filtreleri
// ==========================================

export const FindCashRegistersFilterSchema = z.object({
  clinicId: z.uuid(),
  status: CashRegisterStatusSchema.optional(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});
export type FindCashRegistersFilter = z.infer<
  typeof FindCashRegistersFilterSchema
>;

export const FindCashSessionsFilterSchema = z.object({
  clinicId: z.uuid(),
  cashRegisterId: z.uuid().optional(),
  status: CashSessionStatusSchema.optional(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});
export type FindCashSessionsFilter = z.infer<
  typeof FindCashSessionsFilterSchema
>;

// ==========================================
// Persistence read-model'leri
// ==========================================

/** Oturum + hareketleri (detay görünümü). */
export type CashSessionWithMovements = ICashSession & {
  movements: ICashMovement[];
};

/** Bir oturumdaki hareketlerin yön bazlı toplamı (kapanış hesabı için). */
export interface CashMovementTotals {
  totalIn: Decimal;
  totalOut: Decimal;
}

/**
 * Muhasebe köprüsünün ihtiyaç duyduğu tür-bazlı toplamlar (kapanışta özet fiş).
 * SALE_COLLECTION/REFUND kasıtlı hariç — Payment modülü zaten 100 Kasa'ya işliyor.
 */
export interface CashBridgeTotals {
  bankDepositTotal: Decimal; // BANK_DEPOSIT toplamı (B 102 / A 100)
  expenseTotal: Decimal; // EXPENSE toplamı (B 770 / A 100)
}

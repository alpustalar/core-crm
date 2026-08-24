import { Decimal } from 'decimal.js';
import type { CurrencyType } from '@input-type-schemas/CurrencySchema';

// ==========================================
// KASA OTURUMU (CASH SESSION) — Aç Props
// ==========================================

export interface OpenCashSessionProps {
  /** Optional UUID; auto-generated if omitted. */
  id?: string;
  cashRegisterId: string;
  clinicId: string;
  organizationId: string;
  currency: CurrencyType;
  /** Negatif olamaz — `CashSession.open()` içinde `CashInvalidAmountException`. */
  openingFloat: number;
  openedById: string;
  note?: string | null;
}

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

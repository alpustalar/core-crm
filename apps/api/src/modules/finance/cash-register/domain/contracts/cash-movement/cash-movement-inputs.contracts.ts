import type { CashMovementTypeType } from '@input-type-schemas/CashMovementTypeSchema';
import type { CurrencyType } from '@input-type-schemas/CurrencySchema';

// ==========================================
// KASA HAREKETİ (CASH MOVEMENT) — Props
// ==========================================

export interface RecordCashMovementProps {
  /** Optional UUID; auto-generated if omitted. */
  id?: string;
  cashSessionId: string;
  clinicId: string;
  organizationId: string;
  type: CashMovementTypeType;
  /** 0'dan büyük olmalı — `CashMovement.record()` içinde `CashInvalidAmountException`. */
  amount: number;
  currency: CurrencyType;
  description?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  performedById: string;
}

import type { CurrencyType } from '@input-type-schemas/CurrencySchema';

// ==========================================
// KASA (CASH REGISTER) — Props
// clinicId/organizationId bağlamdan (actor) gelir.
// ==========================================

export interface CreateCashRegisterProps {
  /** Optional UUID; auto-generated if omitted. */
  id?: string;
  clinicId: string;
  organizationId: string;
  name: string;
  currency?: CurrencyType;
}

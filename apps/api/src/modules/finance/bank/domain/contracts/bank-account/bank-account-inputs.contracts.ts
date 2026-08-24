import type { CurrencyType } from '@input-type-schemas/CurrencySchema';

// ==========================================
// BANKA HESABI (BANK ACCOUNT) — Props
// clinicId/organizationId bağlamdan (actor) gelir.
// ==========================================

/** Props for creating a new BankAccount. */
export interface CreateBankAccountProps {
  /** Optional UUID; auto-generated if omitted. */
  id?: string;
  clinicId: string;
  organizationId: string;
  name: string;
  bankName: string;
  iban?: string | null;
  accountNo?: string | null;
  currency?: CurrencyType;
  openingBalance?: number;
}

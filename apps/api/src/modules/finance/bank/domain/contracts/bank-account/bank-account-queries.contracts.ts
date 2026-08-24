import type { BankAccountStatusType } from '@input-type-schemas/BankAccountStatusSchema';
import { Pagination } from '@shared/common';

// ==========================================
// Read-model filtreleri
// ==========================================

export interface FindBankAccountsFilter {
  clinicId: string;
  status?: BankAccountStatusType;
  pagination: Pagination;
}

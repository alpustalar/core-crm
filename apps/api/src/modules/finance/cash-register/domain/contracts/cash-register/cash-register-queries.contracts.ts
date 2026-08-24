import type { CashRegisterStatusType } from '@input-type-schemas/CashRegisterStatusSchema';
import { Pagination } from '@shared/common';

// ==========================================
// Read-model filtreleri
// ==========================================

export interface FindCashRegistersFilter {
  clinicId: string;
  status?: CashRegisterStatusType;
  pagination: Pagination;
}

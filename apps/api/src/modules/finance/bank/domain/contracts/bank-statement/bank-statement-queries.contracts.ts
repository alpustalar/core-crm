import { Pagination } from '@shared/common';
import { BankStatement as IBankStatement } from '@model-schema/BankStatementSchema';
import { BankStatementLine as IBankStatementLine } from '@model-schema/BankStatementLineSchema';

// ==========================================
// Read-model filtreleri
// ==========================================

export interface FindBankStatementsFilter {
  clinicId: string;
  bankAccountId?: string;
  pagination: Pagination;
}

// ==========================================
// Persistence read-model'leri
// ==========================================

export type BankStatementWithLines = IBankStatement & {
  lines: IBankStatementLine[];
};

/** Bir ekstrenin mutabakat özeti — satır sayıları + tutar toplamları (string). */
export interface ReconciliationSummary {
  bankStatementId: string;
  totalLines: number;
  matchedCount: number;
  unmatchedCount: number;
  ignoredCount: number;
  statementNet: string; // tüm satır tutar toplamı
  matchedNet: string; // MATCHED satır toplamı
  unmatchedNet: string; // UNMATCHED satır toplamı
}

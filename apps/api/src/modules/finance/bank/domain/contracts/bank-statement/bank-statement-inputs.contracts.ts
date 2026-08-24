// ==========================================
// EKSTRE (BANK STATEMENT) — Import Props
// ==========================================

export interface BankStatementLineInput {
  transactionDate: Date;
  description: string;
  /** İmzalı: + giriş / − çıkış. */
  amount: number;
  balanceAfter?: number | null;
  reference?: string | null;
  counterpartyName?: string | null;
}

export interface ImportBankStatementProps {
  /** Optional UUID; auto-generated if omitted. */
  id?: string;
  bankAccountId: string;
  clinicId: string;
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  openingBalance?: number | null;
  closingBalance?: number | null;
  fileName?: string | null;
  importedById: string;
  lines: BankStatementLineInput[];
}

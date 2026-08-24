import type { BankStatementLineMatchStatusType } from '@input-type-schemas/BankStatementLineMatchStatusSchema';

// ==========================================
// MUTABAKAT (RECONCILE) — Props
// ==========================================

/**
 * Entity'nin `reconcile` girişi (manuel mutabakat ekranı).
 *
 * İş kuralı: `matchStatus === 'MATCHED'` ise `matchedRef` boş olamaz — bu kural
 * `BankStatementLine.reconcile()` içinde `BankStatementLineMatchRefRequiredException`
 * ile zorlanır (yalnız tip düzeyinde ifade edilemeyen bir invariant).
 */
export interface ReconcileLineInput {
  matchStatus: BankStatementLineMatchStatusType;
  matchedRef?: string | null;
  /** En fazla 500 karakter — `BankStatementLineMatchNoteTooLongException`. */
  matchNote?: string | null;
  reconciledById: string;
}

// ==========================================
// OTO-EŞLEŞTİRME (AUTO-MATCH) — Props
// ==========================================

/** Entity'nin `autoMatch` girişi — tarama tarafından üretilir. */
export interface AutoMatchLineInput {
  /** Eşleşen 102 defter satırının JournalLine.id'si. */
  readonly matchedRef: string;
  /** Motorun ürettiği insan-okur gerekçe (denetim izi). */
  readonly matchNote: string;
  /** Taramayı tetikleyen personel. */
  readonly reconciledById: string;
}

// ==========================================
// İÇE AKTARIM (IMPORT) — Props
// ==========================================

export interface StatementLineImportProps {
  /** Optional UUID; auto-generated if omitted. */
  id?: string;
  bankStatementId: string;
  bankAccountId: string;
  clinicId: string;
  organizationId: string;
  transactionDate: Date;
  description: string;
  amount: number;
  balanceAfter?: number | null;
  reference?: string | null;
  counterpartyName?: string | null;
}

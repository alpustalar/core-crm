import type { BankStatementLineMatchStatusType } from '@input-type-schemas/BankStatementLineMatchStatusSchema';
import { Pagination } from '@shared/common';

// ==========================================
// Read-model filtreleri
// ==========================================

export interface FindStatementLinesFilter {
  bankStatementId: string;
  matchStatus?: BankStatementLineMatchStatusType;
  pagination: Pagination;
}

// ==========================================
// OTO-EŞLEŞTİRME (AUTO-MATCH) — Sonuç
// ==========================================

/** Bir tarama turunun sonucu — UI özeti + denetim. */
export interface AutoMatchResult {
  bankStatementId: string;
  /** Taramaya giren UNMATCHED satır sayısı. */
  scannedCount: number;
  /** Otomatik MATCHED yapılan satır sayısı. */
  matchedCount: number;
  /** Birden çok eşit aday çıktığı için elle bırakılan satır sayısı. */
  ambiguousCount: number;
  /** Hiç aday bulunamayan satır sayısı. */
  unmatchedCount: number;
}

/** Personele sunulan tek aday (elle mutabakat ekranı). */
export interface LineMatchSuggestion {
  /** JournalLine.id — `matchedRef` olarak gönderilir. */
  matchedRef: string;
  entryId: string;
  entryNo: string | null;
  entryDate: Date;
  description: string | null;
  amount: string;
  /** 0–100 güven puanı; liste bu puana göre sıralıdır. */
  score: number;
  dayDifference: number;
  reason: string;
  /** Bu aday başka bir ekstre satırına zaten bağlıysa true (seçilmemeli). */
  alreadyUsed: boolean;
}

/**
 * `apps/api` → `FinanceLedgerQueryController` cevap sözleşmeleri.
 *
 * **Opsiyonel alanlar yetki demektir, eksik veri değil.** Backend cevabı
 * `@Serialize` ile serileştirme gruplarından geçiriyor: tutar/ciro alanları
 * yalnız finans tier'ına (`FINANCIAL`/`MANAGEMENT`/`ADMIN`) açık, resepsiyonun
 * gördüğü cevaptan **tamamen silinerek** gelir. Bu yüzden burada `string | null`
 * değil `?: string` yazılıdır — `null` "boş", `undefined` "görme yetkin yok".
 * Arayüz ikisini aynı şeye çevirmemeli.
 */

/** Klinik cari defteri satırı (`FinanceLedgerResponseDto`). */
export interface ClinicLedgerEntry {
  id: string;
  organizationId: string;
  clinicId: string;
  patientId: string | null;

  // --- Operasyon tier'ı ---
  type?: string;
  source?: string;
  category?: string;
  status?: string;
  description?: string | null;
  documentNo?: string | null;
  entryDate?: string;

  // --- Finans tier'ı ---
  amount?: number;
  currency?: string;
  taxRate?: number;
  taxAmount?: number;
  paymentId?: string | null;
  installmentId?: string | null;
  performedById?: string | null;

  // --- Yönetim tier'ı ---
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Klinik finans özeti (`LedgerSummaryResponseDto`). Tutarlar `string`: sunucu
 * `Decimal` tutuyor ve JSON'a string olarak yazıyor — `number`a çevirmek kuruş
 * hassasiyetini kaybettirir, bu yüzden istemci de string taşır.
 */
export interface LedgerSummaryView {
  totalIncome?: string;
  totalExpenses?: string;
  balance?: string;
  entryCount?: number;
}

/** Hasta cari özeti (`PatientFinanceSummaryResponseDto`). */
export interface PatientFinanceSummaryView {
  /** Kalan bakiye — tahsilat yapan resepsiyona da açık. */
  balance?: string;
  totalServiceAmount?: string;
  totalPayments?: string;
}

/** Hasta cari hareketi (`PatientLedgerItemResponseDto`). */
export interface PatientLedgerEntry {
  id?: string;
  category?: string;
  entryDate?: string;
  status?: string;
  description?: string | null;
  paymentMethod?: string | null;
  providerName?: string | null;
  amount?: string;
}

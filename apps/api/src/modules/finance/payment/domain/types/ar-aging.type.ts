import { Decimal } from 'decimal.js';

/** Açık taksit / tahsilat performansı sorgusu — şube bazlı. */
export interface ArAgingFilter {
  clinicId: string;
}

/** Tek bir açık (PENDING/OVERDUE) taksit satırı — yaşlandırma için ham veri. */
export interface OpenInstallmentRow {
  patientId: string;
  amount: Decimal;
  dueDate: Date | null;
}

/** AR aging ham verisi: açık taksitler + tahsil edilmiş toplam (COMPLETED). */
export interface ArAgingData {
  openInstallments: OpenInstallmentRow[];
  collectedTotal: Decimal;
}

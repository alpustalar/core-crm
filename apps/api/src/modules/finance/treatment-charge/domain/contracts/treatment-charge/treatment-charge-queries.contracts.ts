import { CurrencyType } from '@input-type-schemas/CurrencySchema';

/**
 * Bir randevunun satır toplamları. Fatura ve tahsilat tutarları buradan türer;
 * tutarlar string'dir (Decimal serileştirme kaybı yaşanmasın diye).
 */
export interface AppointmentChargeSummary {
  appointmentId: string;
  clinicId: string;
  patientId: string;
  currency: CurrencyType;
  /** İndirimsiz toplam (liste × adet) */
  listTotal: string;
  discountTotal: string;
  /** Matrah (KDV hariç) */
  netTotal: string;
  vatTotal: string;
  /** Genel toplam (KDV dahil) — faturanın `amount`'ı budur */
  grandTotal: string;
  /** Satırların ortak KDV oranı; fatura tek oranlı olduğu için tekil olmak zorunda */
  vatRate: number;
  lineCount: number;
}

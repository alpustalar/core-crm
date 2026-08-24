import { Decimal } from 'decimal.js';

/**
 * Payment domain kontratları — okuma modelleri (yaşlandırma/rapor read-model'leri
 * + dış sağlayıcı taksit seçenekleri).
 */

// ==========================================
// YAŞLANDIRMA & RAPORLAMA (AGING & REVENUE)
// ==========================================

export interface ArAgingFilter {
  clinicId: string;
}

/** Henüz tahsil edilmemiş (açık) taksit — repository projeksiyon satırı. */
export interface OpenInstallmentRow {
  patientId: string;
  amount: Decimal;
  dueDate: Date | null;
}

export interface ArAgingData {
  openInstallments: OpenInstallmentRow[];
  collectedTotal: Decimal;
}

/** Tahsil edilmiş taksit — hekim boyutu (yönetim raporu). */
export interface CollectedInstallmentRow {
  /** Atanmamış hekimler için null desteği. */
  providerId: string | null;
  amount: Decimal;
}

export interface ProviderRevenueFilterData {
  clinicId: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// ==========================================
// TAKSİT SEÇENEKLERİ — iyzico API'sinden gelen read-model
// ==========================================

export interface InstallmentOption {
  installmentNumber: number;
  totalPrice: number;
  installmentPrice: number;
  installmentRate: number;
}

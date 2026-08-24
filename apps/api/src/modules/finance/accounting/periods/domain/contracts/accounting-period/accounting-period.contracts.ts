// ==========================================
// ACCOUNTING PERIOD (MUHASEBE DÖNEMİ) SÖZLEŞMELERİ
// ==========================================

export interface CreateAccountingPeriodProps {
  id?: string;
  clinicId: string;
  organizationId: string;

  // Yıl bilgisi 2000-2100 aralığında olmalıdır — AccountingPeriod.create() doğrular.
  year: number;
}

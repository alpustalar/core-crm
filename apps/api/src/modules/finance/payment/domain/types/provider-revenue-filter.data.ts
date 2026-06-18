/** Hekim bazında ciro sorgusu — şube bazlı, opsiyonel tahsilat (paidAt) aralığı. */
export interface ProviderRevenueFilterData {
  clinicId: string;
  dateFrom?: Date;
  dateTo?: Date;
}

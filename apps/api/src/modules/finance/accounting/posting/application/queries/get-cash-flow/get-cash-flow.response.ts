import { QueryResponse } from '@shared/common/response/response.interface';

/** Bir ayın nakit hareketi (tutarlar string). */
export interface CashFlowMonth {
  month: string; // YYYY-MM
  inflow: string; // nakit girişi (borç)
  outflow: string; // nakit çıkışı (alacak)
  net: string; // inflow - outflow
  closingBalance: string; // ay sonu yürüyen nakit pozisyonu
}

export interface CashFlowTotals {
  inflow: string;
  outflow: string;
  net: string;
}

export interface CashFlowReport {
  clinicId: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  openingBalance: string; // dateFrom öncesi net nakit pozisyonu
  closingBalance: string; // dönem sonu net nakit pozisyonu
  months: CashFlowMonth[]; // kronolojik (artan ay)
  totals: CashFlowTotals;
}

export type GetCashFlowResponse = QueryResponse<CashFlowReport>;

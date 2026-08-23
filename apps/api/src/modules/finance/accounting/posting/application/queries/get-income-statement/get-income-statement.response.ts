import { QueryResponse } from '@shared/common/response/response.interface';

export interface IncomeStatementReportLine {
  code: string;
  name: string;
  amount: string;
}

export interface IncomeStatementReportSection {
  lines: IncomeStatementReportLine[];
  total: string;
}

/** Önceki dönemin yalnız ana satırları — kalem dökümü tekrarlanmaz. */
export interface IncomeStatementPeriodTotals {
  dateFrom: Date;
  dateTo: Date;
  netSales: string;
  grossProfit: string;
  operatingProfit: string;
  netProfit: string;
}

/** Cari döneme göre yüzde değişim (önceki 0 ve cari > 0 ise %100). */
export interface IncomeStatementDeltas {
  netSalesPct: number;
  grossProfitPct: number;
  operatingProfitPct: number;
  netProfitPct: number;
}

export interface IncomeStatementComparison {
  previous: IncomeStatementPeriodTotals;
  deltas: IncomeStatementDeltas;
}

/** Gelir Tablosu — TDHP yapısında dönem kâr/zarar dökümü (tutarlar string). */
export interface IncomeStatementReport {
  clinicId: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  grossSales: IncomeStatementReportSection; // brüt satışlar (60x)
  salesDeductions: IncomeStatementReportSection; // satış indirimleri (61x)
  netSales: string;
  costOfSales: IncomeStatementReportSection; // satışların maliyeti (62x/74x)
  grossProfit: string;
  operatingExpenses: IncomeStatementReportSection; // faaliyet giderleri (63x/76x/77x)
  operatingProfit: string;
  otherIncome: IncomeStatementReportSection; // diğer gelirler (64x/67x)
  otherExpense: IncomeStatementReportSection; // diğer giderler (65x/66x/68x)
  netProfit: string; // dönem net kârı/zararı (+ kâr, − zarar)

  /**
   * Önceki eşit uzunluktaki dönemle karşılaştırma. Yalnız `compare=true` VE
   * tarih aralığı verildiğinde dolar; açık uçlu raporda "önceki dönem" tanımsız
   * olduğu için null kalır.
   */
  comparison: IncomeStatementComparison | null;
}

export type GetIncomeStatementResponse = QueryResponse<IncomeStatementReport>;

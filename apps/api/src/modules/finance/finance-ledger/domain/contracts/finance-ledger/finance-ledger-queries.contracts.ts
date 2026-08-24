// ==========================================
// Defter özet / read-model sözleşmeleri
// ==========================================

/** Finansal özet döndürürken veri tipini korumak için tip sözleşmesi. */
export interface LedgerSummary {
  totalIncome: string;
  totalExpenses: string;
  balance: string;
  entryCount: number;
}

export interface GetSummaryFilter {
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PatientFinanceSummary {
  balance: string;
  totalServiceAmount: string;
  totalPayments: string;
}

export interface PatientLedgerItem {
  id: string;
  amount: string;
  category: string; // veya LedgerCategoryType
  entryDate: Date;
  status: string; // veya LedgerStatusType
  description: string | null;
  paymentMethod: string | null; // veya PaymentMethodType
  providerName: string | null;
}

/** Reklam kampanyasına atfedilmiş hasta geliri (ROI / Attribution için). */
export interface PatientRevenue {
  patientId: string;
  revenue: string;
}

export interface SumIncomeByPatientsFilter {
  patientIds: string[];
  from: Date;
  to: Date;
}

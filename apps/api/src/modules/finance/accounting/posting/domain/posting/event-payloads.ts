/**
 * FinancialEvent.payload'ın posting kurallarınca beklenen tipli biçimleri.
 * Tutarlar string (Decimal hassasiyeti korunur).
 */

export interface PaymentReceivedEventPayload {
  method: 'CASH' | 'BANK_TRANSFER' | 'POS_CARD' | string;
  amount: string;
  partyId: string;
}

export interface SalesInvoiceIssuedEventPayload {
  partyId: string;
  netTotal: string;
  vatTotal: string;
  grandTotal: string;
  revenueAccountCode?: string; // ör. '600.04' (İmplant); verilmezse '600.01'
}

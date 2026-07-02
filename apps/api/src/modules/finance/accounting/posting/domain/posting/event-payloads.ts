/**
 * FinancialEvent.payload'ın posting kurallarınca beklenen tipli biçimleri.
 * Tutarlar string (Decimal hassasiyeti korunur).
 */

import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export interface PaymentReceivedEventPayload {
  method: 'CASH' | 'BANK_TRANSFER' | 'POS_CARD' | string;
  amount: string;
  partyId: string;
  /**
   * İşlemin para birimi. Verilmezse defterin fonksiyonel para birimi varsayılır.
   * Yabancı para (ör. sağlık turizmi EUR tahsilatı) ise posting fonksiyonel paraya çevirir.
   */
  currency?: CurrencyType;
}

export interface SalesInvoiceIssuedEventPayload {
  partyId: string;
  netTotal: string;
  vatTotal: string;
  grandTotal: string;
  revenueAccountCode?: string; // ör. '600.04' (İmplant); verilmezse '600.01'
  withholdingTotal?: string; // SMM/serbest meslek stopajı (193); ödeyen vergi sorumlusuysa > 0
  currency?: CurrencyType; // yabancı fatura (ör. sağlık turizmi EUR) → posting'de fonksiyonel paraya çevrilir
}

export interface PurchaseInvoiceReceivedEventPayload {
  partyId: string; // tedarikçi carisi (320)
  netTotal: string;
  vatTotal: string;
  grandTotal: string;
  lineAccountCode: string; // 150 (stok) | 770/760/740 (gider)
  currency?: CurrencyType; // yurtdışı tedarikçi / ithal (EUR/USD) → posting'de fonksiyonel paraya çevrilir
}

export interface PayrollAccruedEventPayload {
  partyId: string; // personel carisi (335)
  grossSalary: string; // brüt ücret
  employerSgk: string; // işveren SGK payı
  netPayable: string; // personele net ödenecek
  taxWithholding: string; // GV stopajı + damga (360)
  employeeSgk: string; // işçi SGK kesintisi (361 = employeeSgk + employerSgk)
}

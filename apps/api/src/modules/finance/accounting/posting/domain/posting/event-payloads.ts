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

/**
 * Satıcıya yapılan ödeme — 320'deki borcu kapatır.
 *
 * `PaymentReceivedEventPayload`'ın karşı yönü: orada müşteriden tahsil edilip
 * 120 kapanır, burada satıcıya ödenip 320 kapanır.
 */
export interface PaymentMadeEventPayload {
  method: 'CASH' | 'BANK_TRANSFER' | string;
  amount: string;
  partyId: string;
  /** Verilmezse defterin fonksiyonel para birimi varsayılır (bkz. Model A). */
  currency?: CurrencyType;
  /** Havale/dekont referansı — fiş açıklamasına geçer. */
  reference?: string;
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

export interface CashSessionClosedEventPayload {
  bankDepositTotal: string; // oturumdaki BANK_DEPOSIT toplamı (B 102 / A 100)
  expenseTotal: string; // oturumdaki EXPENSE toplamı (B 770 / A 100)
  difference: string; // sayım − beklenen (imzalı): + fazla (B 100 / A 679), − açık (B 689 / A 100)
  currency?: CurrencyType; // yabancı kasa → posting fonksiyonel paraya çevirir (Model A)
}

/**
 * Sağlık turizmi rezervasyon tahsilatı — **platform** defterine yazılır.
 *
 * Platform aracıdır (acente): müşteriden `saleAmount` tahsil edilir, bunun
 * `supplierAmount` kadarı tedarikçiye (HotelBeds) borçtur, kalan `commission`
 * platformun geliridir. Bu yüzden gelir olarak **yalnız komisyon** yazılır;
 * tedarikçi payı hasılat değil borçtur (aracı/net yaklaşımı).
 *
 * `saleAmount = commission + supplierAmount` — kural bu eşitliği doğrular.
 */
export interface PlatformBookingSettledEventPayload {
  saleAmount: string; // müşteriden tahsil edilen brüt
  supplierAmount: string; // tedarikçiye (HotelBeds) borç — net maliyet
  commission: string; // platform geliri = saleAmount − supplierAmount
  currency: CurrencyType; // satış para birimi; posting fonksiyonel paraya çevirir (Model A)
  bookingType: string; // HOTEL | TRANSFER — fiş açıklaması için
  provider: string; // IYZICO | STRIPE — tahsilatın geldiği kanal
}

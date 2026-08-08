export const FINANCIAL_EVENT_SOURCE_MODULES = {
  PAYROLL: 'payroll',
  PURCHASE_INVOICE: 'purchase-invoice',
  PAYMENT: 'payment',
  POS: 'pos',
  CASH_REGISTER: 'cash-register',
  INVOICE: 'invoice',
  /** Sağlık turizmi rezervasyon tahsilatı — platform defterine yazar. */
  BOOKING_PAYMENT: 'booking-payment',
} as const;

export type FinancialEventSourceModule =
  (typeof FINANCIAL_EVENT_SOURCE_MODULES)[keyof typeof FINANCIAL_EVENT_SOURCE_MODULES];

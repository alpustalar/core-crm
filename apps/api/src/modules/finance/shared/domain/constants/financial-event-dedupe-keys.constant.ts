export const FinancialEventDedupeKeys = {
  payroll_accrual: (employeeUserId: string, monthKey: string) =>
    `payroll-accrual:${employeeUserId}:${monthKey}`,
  purchase_invoice: (purchaseInvoiceId: string) =>
    `purchase-invoice:${purchaseInvoiceId}`,
  payment_received: (installmentId: string) =>
    `payment-received:${installmentId}`,
  cash_session_closed: (sessionId: string) =>
    `cash-session-closed:${sessionId}`,
  payment_received_pos: (posTransactionId: string) =>
    `payment-received:pos:${posTransactionId}`,
  sales_invoice: (invoiceId: string) => `sales-invoice:${invoiceId}`,
  platform_booking_settled: (bookingPaymentId: string) =>
    `platform-booking-settled:${bookingPaymentId}`,
  // Dekont numarası klinik içinde tekil kabul edilir; farklı kliniklerin aynı
  // referansı kullanması meşru olduğu için anahtar clinicId ile daraltılır.
  supplier_payment: (clinicId: string, reference: string) =>
    `supplier-payment:${clinicId}:${reference}`,
  purchase_bridge_failed: (purchaseInvoiceId: string) =>
    `purchase-bridge-failed:${purchaseInvoiceId}`,
} as const;

export type FinancialEventDedupeKey =
  (typeof FinancialEventDedupeKeys)[keyof typeof FinancialEventDedupeKeys];

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
} as const;

export type FinancialEventDedupeKey =
  (typeof FinancialEventDedupeKeys)[keyof typeof FinancialEventDedupeKeys];

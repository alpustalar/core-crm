export const INVOICE_EVENTS = {
  ISSUED: 'invoice.issued',
  FAILED: 'invoice.failed',
} as const;

export type InvoiceEvent = (typeof INVOICE_EVENTS)[keyof typeof INVOICE_EVENTS];

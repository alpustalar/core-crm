export const PAYMENT_EVENTS = {
  PAID: 'payment.paid',
  FAILED: 'payment.failed',
  REFUNDED: 'payment.refunded',
  INITIATED: 'payment.initiated',
  CANCELLED: 'payment.cancelled',
} as const;

export type PaymentEvent = (typeof PAYMENT_EVENTS)[keyof typeof PAYMENT_EVENTS];

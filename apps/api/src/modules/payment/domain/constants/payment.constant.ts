// modules/payment/domain/constants/payment.constant.ts

export const PAYMENT_ACTIONS = {
  REFUND: 'geri ödeme',
  INITIALIZE: 'ödeme başlatma',
  CANCEL: 'ödeme iptali',
  CALLBACK: 'callback işleme',
} as const;

export type PaymentAction =
  (typeof PAYMENT_ACTIONS)[keyof typeof PAYMENT_ACTIONS];

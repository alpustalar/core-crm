export const PaymentProviders = {
  IYZICO: 'IYZICO',
  PAYPAL: 'PAYPAL',
  STRIPE: 'STRIPE',
} as const;

export type PaymentProvider =
  (typeof PaymentProviders)[keyof typeof PaymentProviders];

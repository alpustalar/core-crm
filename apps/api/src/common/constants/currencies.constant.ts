export const CURRENCIES = {
  TRY: 'TRY',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
} as const;

export type Currency = (typeof CURRENCIES)[keyof typeof CURRENCIES];

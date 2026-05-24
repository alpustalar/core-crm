export const IYZICO_TERMINAL_SANDBOX_BASE_URL =
  'https://sandbox-api.iyzipay.com';
export const IYZICO_TERMINAL_PROD_BASE_URL = 'https://api.iyzipay.com';

export const IYZICO_TERMINAL_PATHS = {
  AUTHORIZE: '/in-store/oauth2/authorize',
  TOKEN: '/in-store/oauth2/token',
  PAYMENT: '/v2/terminal-host/payment',
  VOID: '/v2/terminal-host/payment/void',
  REFUND: '/v2/terminal-host/payment/refund',
  EOD: '/v2/terminal-host/eod',
} as const;

/** Token yenileme için eşik: süre dolmadan bu kadar önce refresh tetiklenir (ms) */
export const IYZICO_TERMINAL_TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

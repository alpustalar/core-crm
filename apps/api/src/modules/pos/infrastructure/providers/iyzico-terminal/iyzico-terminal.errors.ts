// ---------------------------------------------------------------------------
// Error Groups
// ---------------------------------------------------------------------------

export type IyzicoTerminalErrorGroup =
  | 'TIMEOUT_ERROR'
  | 'SYSTEM_ERROR'
  | 'BANK_ERROR'
  | 'DEVICE_ERROR'
  | 'PAYMENT_ERROR'
  | 'BUSINESS_ERROR'
  | 'VALIDATION_ERROR';

// ---------------------------------------------------------------------------
// Error Codes
// ---------------------------------------------------------------------------

export const IYZICO_TERMINAL_ERROR_CODES = {
  // SYSTEM_ERROR — token sorunları ve yetkisiz erişim
  INVALID_TOKEN: '100310',
  ACCESS_TOKEN_EXPIRED: '100311',
  AUTH_DEVICE_NO_ACCESS: '380102',

  // TIMEOUT_ERROR — cihaz cevap vermedi
  DEVICE_TIMEOUT: '380103',

  // DEVICE_ERROR — POS cihazı kaynaklı
  TERMINAL_BUSY: '380201',
  TECHPOS_START_ERROR: '380202',
  NULL_RESPONSE: '380203',
  REFRESH_TOKEN_SESSION_ERROR: '380204',
  RESPONSE_CREATION_ERROR: '380205',

  // BUSINESS_ERROR — iş kuralı ihlalleri
  AUTH_DEVICE_NOT_FOUND: '380101',
  PAYMENT_NOT_FOUND_BY_PAYMENT_ID: '380107',
  PAYMENT_NOT_FOUND_BY_ID: '380108',
  PAYMENT_NOT_FOUND_BY_ORDER_ID: '380109',
  INSUFFICIENT_BALANCE: '380112',

  // VALIDATION_ERROR — hatalı request
  REQUEST_VALIDATION_ERROR: '380104',
  OPERATION_NOT_SUPPORTED: '380105',
  MISSING_REQUIRED_IDENTIFIERS: '380111',
} as const;

export type IyzicoTerminalErrorCode =
  (typeof IYZICO_TERMINAL_ERROR_CODES)[keyof typeof IYZICO_TERMINAL_ERROR_CODES];

// ---------------------------------------------------------------------------
// Retry sets (docs: errors.md > Retry Strategy)
// ---------------------------------------------------------------------------

/** Bu gruplardaki hatalar yeniden denenebilir. */
export const IYZICO_TERMINAL_RETRYABLE_GROUPS = new Set<IyzicoTerminalErrorGroup>([
  'TIMEOUT_ERROR',
  'DEVICE_ERROR',
]);

/** Token hatalarında callApi 401 retry'ı devreye girer; ayrıca listeye alınmadı. */
export const IYZICO_TERMINAL_RETRYABLE_CODES = new Set<string>([
  IYZICO_TERMINAL_ERROR_CODES.DEVICE_TIMEOUT,
  IYZICO_TERMINAL_ERROR_CODES.TERMINAL_BUSY,
  IYZICO_TERMINAL_ERROR_CODES.NULL_RESPONSE,
  IYZICO_TERMINAL_ERROR_CODES.RESPONSE_CREATION_ERROR,
]);

// ---------------------------------------------------------------------------
// Error Classes
// ---------------------------------------------------------------------------

/** iyzico Terminal API operation hatası (payment, void, refund, eod) */
export class IyzicoTerminalOperationError extends Error {
  constructor(
    public readonly code: string,
    public readonly group: IyzicoTerminalErrorGroup,
    message: string,
    public readonly raw?: unknown,
  ) {
    super(message);
    this.name = 'IyzicoTerminalOperationError';
  }
}

/** HTTP seviyesinde auth hatası (401, token alınamadı vb.) */
export class IyzicoTerminalAuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly responseBody?: unknown,
  ) {
    super(message);
    this.name = 'IyzicoTerminalAuthError';
  }
}

/** OAuth2 token endpoint'inden hata dönmesi */
export class IyzicoTerminalTokenRefreshError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IyzicoTerminalTokenRefreshError';
  }
}

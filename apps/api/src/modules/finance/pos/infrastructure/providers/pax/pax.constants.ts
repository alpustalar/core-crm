export const PAX_STX = 0x02;
export const PAX_ETX = 0x03;
export const PAX_FS = 0x1c;

export const PAX_PROTOCOL_VERSION = '1.28';

export const PAX_DEFAULT_PORT = 10009;
export const PAX_DEFAULT_TIMEOUT_MS = 90_000;

export const PAX_COMMANDS = {
  DO_CREDIT: 'T01',
  DO_DEBIT: 'T00',
  BATCH_CLOSE: 'T06',
} as const;

export const PAX_TRANS_TYPE = {
  SALE: '01',
  REFUND: '02',
  VOID: '16',
} as const;

// "000000" = onaylı; diğer her değer reddedilmiş / hata
export const PAX_APPROVED_RESULT_CODE = '000000';

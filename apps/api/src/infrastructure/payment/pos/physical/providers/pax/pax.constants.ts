export const PAX_STX = 0x02;
export const PAX_ETX = 0x03;
export const PAX_FS = 0x1c; // alan ayırıcı (Field Separator)
export const PAX_US = 0x1f; // alt-alan ayırıcı (Unit Separator)

// El sıkışma byte'ları (ACK/NAK/EOT)
export const PAX_ACK = 0x06; // "paketi sağlam aldım"
export const PAX_NAK = 0x15; // "bozuk geldi, tekrar gönder"
export const PAX_EOT = 0x04; // oturum/iletim sonu

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

import { PAX_ETX, PAX_FS, PAX_STX } from '../pax.constants';

/**
 * Paket yapısı: [STX][cmd][FS][field1][FS][field2]...[ETX][LRC]
 * LRC = STX'ten sonraki her bayt (ETX dahil) XOR'u
 */
export function buildPacket(
  command: string,
  fields: (string | undefined)[]
): Buffer {
  const parts = [command, ...fields.map((f) => f ?? '')];
  const body = parts.join(String.fromCharCode(PAX_FS));
  const bodyBuf = Buffer.from(body, 'ascii');

  // STX(1) + body + ETX(1) + LRC(1)
  const packet = Buffer.alloc(bodyBuf.length + 3);
  packet[0] = PAX_STX;
  bodyBuf.copy(packet, 1);
  packet[bodyBuf.length + 1] = PAX_ETX;

  let lrc = 0;
  for (let i = 1; i <= bodyBuf.length + 1; i++) {
    lrc ^= packet[i];
  }
  packet[bodyBuf.length + 2] = lrc;

  return packet;
}

export function parsePacket(data: Buffer): {
  command: string;
  fields: string[];
  isValid: boolean;
} {
  if (data.length < 4 || data[0] !== PAX_STX) {
    return { command: '', fields: [], isValid: false };
  }

  // ETX ikinci-son bayt; son bayt LRC
  const etxIndex = data.length - 2;
  if (data[etxIndex] !== PAX_ETX) {
    return { command: '', fields: [], isValid: false };
  }

  let lrc = 0;
  for (let i = 1; i <= etxIndex; i++) {
    lrc ^= data[i];
  }
  const isValid = lrc === data[data.length - 1];

  const body = data.slice(1, etxIndex).toString('ascii');
  const parts = body.split(String.fromCharCode(PAX_FS));

  return {
    command: parts[0] ?? '',
    fields: parts.slice(1),
    isValid,
  };
}

/** PAX minor-unit tutarı → 12 haneli sıfır-dolgulu string (örn. 10000 → "000000010000") */
export function formatAmount(amountInMinorUnits: number): string {
  return Math.round(amountInMinorUnits).toString().padStart(12, '0');
}

/** response alanlarını index-keyed record'a dönüştür (ham debug için) */
export function fieldsToRecord(fields: string[]): Record<string, string> {
  return Object.fromEntries(fields.map((v, i) => [`field_${i}`, v]));
}

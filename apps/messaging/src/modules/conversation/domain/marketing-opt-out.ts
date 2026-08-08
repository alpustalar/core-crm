import { z } from 'zod';

/**
 * Gelen mesaj gövdesinden pazarlama opt-out/opt-in niyetini sezer (TR + EN anahtar
 * kelimeler). WhatsApp pazarlama uyumu: kontak "DUR/STOP" yazınca pazarlama şablonları
 * gönderilmemeli. Tam eşleşme (trim + normalize) aranır; serbest metinde yanlış
 * pozitif olmaması için kelimenin kendisi beklenir.
 */
const OPT_OUT_KEYWORDS = new Set([
  'STOP',
  'DUR',
  'IPTAL',
  'CIKAR',
  'CIKIS',
  'UNSUBSCRIBE',
  'ABONELIKTEN CIK',
]);

const OPT_IN_KEYWORDS = new Set([
  'START',
  'BASLA',
  'KATIL',
  'ABONE',
  'SUBSCRIBE',
]);

/** Türkçe karakterleri sadeleştirip büyük harfe çevirir (İ/ı/ç/ş... → I/C/S...). */
function normalize(text: string): string {
  return text
    .trim()
    .toUpperCase()
    .replace(/İ/g, 'I')
    .replace(/I/g, 'I')
    .replace(/Ç/g, 'C')
    .replace(/Ş/g, 'S')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ö/g, 'O');
}

export const OptIntentSchema = z.enum(['opt_out', 'opt_in']);

export type OptIntent = z.infer<typeof OptIntentSchema>;

export function detectOptIntent(
  body: string | null | undefined
): OptIntent | null {
  if (!body) return null;
  const normalized = normalize(body);
  if (OPT_OUT_KEYWORDS.has(normalized)) return 'opt_out';
  if (OPT_IN_KEYWORDS.has(normalized)) return 'opt_in';
  return null;
}

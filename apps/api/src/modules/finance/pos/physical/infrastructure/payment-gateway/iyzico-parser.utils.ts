/** Orijinal işlemin ham yanıtından iyzico paymentDate'ini çıkarır. */
export function extractIyzicoPaymentDate(
  rawResponse: unknown
): string | undefined {
  const raw = rawResponse as { paymentDate?: unknown } | null;
  return typeof raw?.paymentDate === 'string' ? raw.paymentDate : undefined;
}

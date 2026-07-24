/**
 * Kasa kapanış metadatası — frontend fazla/açık (difference) bilgisini gösterir.
 * difference > 0 fazla, < 0 açık (kasa eksiği).
 */
export interface CloseCashSessionResponse {
  sessionId: string;
  status: string;
  expectedAmount: string;
  countedAmount: string;
  difference: string;
}

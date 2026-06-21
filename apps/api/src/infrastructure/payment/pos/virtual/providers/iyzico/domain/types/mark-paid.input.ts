export interface MarkPaidInput {
  iyzicoTransactionId: string;
  iyzicoPaymentId: string;
  iyzicoPaymentTransactionId?: string;
  rawResponse?: unknown;
}

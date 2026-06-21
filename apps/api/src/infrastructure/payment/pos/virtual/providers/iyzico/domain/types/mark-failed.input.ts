export interface MarkFailedInput {
  iyzicoTransactionId: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: unknown;
}

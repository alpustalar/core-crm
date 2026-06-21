export interface RetrieveCheckoutFormResult {
  isSuccess: boolean;
  paymentId: string;
  paymentTransactionId: string | undefined;
  errorCode: string | undefined;
  errorMessage: string | undefined;
  rawResponse: unknown;
}

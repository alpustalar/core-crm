export interface PaxTransactionResponse {
  posTransactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  approved?: boolean;
  responseText?: string;
  authorizationCode?: string;
  externalRef?: string;
  maskedCardNumber?: string;
  cardType?: string;
}

export interface PaxBatchCloseResponse {
  success: boolean;
  responseCode: string;
  responseText: string;
}

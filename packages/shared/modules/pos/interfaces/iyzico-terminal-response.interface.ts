export interface IyzicoTerminalTransactionResponse {
  posTransactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  approved?: boolean;
  /** iyzico tarafının ürettiği ödeme kimliği (iade/iptalde gerekir) */
  iyzicoPaymentId?: string;
  authCode?: string;
  hostReference?: string;
  maskedCardNumber?: string;
  cardType?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface IyzicoTerminalEodResponse {
  status: 'SUCCESS' | 'FAILED';
  batchNo?: string;
  saleCount?: number;
  saleAmount?: number;
  voidCount?: number;
  voidAmount?: number;
  refundCount?: number;
  refundAmount?: number;
  currency?: string;
  errorCode?: string;
  errorMessage?: string;
}

export const PHYSICAL_POS_PROVIDER = Symbol('IPhysicalPosProvider');

export interface InitiatePosPaymentInput {
  posTransactionId: string;
  terminalId: string;
  merchantId: string;
  amount: number;
  currency: string;
}

export interface InitiatePosPaymentResult {
  externalRef: string;
  rawRequest?: unknown;
}

export interface PosCallbackPayload {
  externalRef: string;
  rawResponse: unknown;
}

export const PosCallbackStatuses = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  TIMEOUT: 'TIMEOUT',
} as const;

export type PosCallbackStatus =
  (typeof PosCallbackStatuses)[keyof typeof PosCallbackStatuses];

export interface PosCallbackResult {
  status: PosCallbackStatus;
  rawResponse: unknown;
}

export interface IPhysicalPosProvider {
  initiate(input: InitiatePosPaymentInput): Promise<InitiatePosPaymentResult>;
  parseCallback(payload: PosCallbackPayload): Promise<PosCallbackResult>;
}

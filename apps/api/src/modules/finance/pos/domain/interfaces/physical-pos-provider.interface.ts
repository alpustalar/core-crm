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

export type PosCallbackStatus = 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'TIMEOUT';

export interface PosCallbackResult {
  status: PosCallbackStatus;
  rawResponse: unknown;
}

export interface IPhysicalPosProvider {
  initiate(input: InitiatePosPaymentInput): Promise<InitiatePosPaymentResult>;
  parseCallback(payload: PosCallbackPayload): Promise<PosCallbackResult>;
}

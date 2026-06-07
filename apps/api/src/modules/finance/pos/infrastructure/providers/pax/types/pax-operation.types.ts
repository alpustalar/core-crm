import type { PaxDeviceConfig } from './pax-device-config.type';

export interface PaxSaleInput {
  device: PaxDeviceConfig;
  amountInMinorUnits: number;
  ecReferenceNumber: string;
  timeout?: number;
}

export interface PaxRefundInput {
  device: PaxDeviceConfig;
  amountInMinorUnits: number;
  ecReferenceNumber: string;
  originalReferenceNumber?: string;
  timeout?: number;
}

export interface PaxVoidInput {
  device: PaxDeviceConfig;
  ecReferenceNumber: string;
  originalReferenceNumber: string;
  timeout?: number;
}

export interface PaxBatchCloseInput {
  device: PaxDeviceConfig;
  timeout?: number;
}

export interface PaxResult {
  approved: boolean;
  responseCode: string;
  responseText: string;
  authorizationCode?: string;
  cardType?: string;
  maskedCardNumber?: string;
  externalRef?: string;
  rawResponse: Record<string, string>;
}

export interface PaxBatchCloseResult {
  success: boolean;
  responseCode: string;
  responseText: string;
  rawResponse: Record<string, string>;
}

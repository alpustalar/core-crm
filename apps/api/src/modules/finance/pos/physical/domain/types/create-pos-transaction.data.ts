import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export interface CreatePosTransactionData {
  id: string;
  posDeviceId: string;
  clinicId: string;
  patientId?: string;
  appointmentId?: string;
  paymentId?: string;
  amount: number;
  currency?: CurrencyType;
  externalRef?: string;
  rawRequest?: unknown;
}

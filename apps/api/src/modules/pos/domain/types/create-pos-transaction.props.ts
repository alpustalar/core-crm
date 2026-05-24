export interface CreatePosTransactionProps {
  id: string;
  posDeviceId: string;
  clinicId: string;
  patientId?: string;
  appointmentId?: string;
  paymentId?: string;
  amount: number;
  currency?: string;
  externalRef?: string;
  rawRequest?: unknown;
}

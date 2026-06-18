import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export interface CreateTransferBookingProps {
  id: string;
  reference: string;
  clientReference?: string;
  holderName: string;
  holderSurname: string;
  holderEmail: string;
  holderPhone: string;
  transfers: unknown;
  totalAmount: number;
  currency: CurrencyType;
  remarks?: string;
  organizationId: string;
  clinicId?: string;
  patientId?: string;
  leadId?: string;
}

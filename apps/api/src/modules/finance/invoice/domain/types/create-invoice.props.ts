import { InvoiceStatusType as InvoiceStatus } from '@input-type-schemas/InvoiceStatusSchema';
import { Decimal } from 'decimal.js';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export interface CreateInvoiceProps {
  id: string;
  clinicId: string;
  patientId: string;
  appointmentId: string | null;
  paymentId: string | null;
  amount: number;
  currency: CurrencyType;
  vatRate: number;
  netTotal: Decimal;
  vatTotal: Decimal;
  status: InvoiceStatus;
  invoiceNumber?: string;
  issuedAt?: Date;
  providerRef?: string;
  rawResponse?: unknown;
}

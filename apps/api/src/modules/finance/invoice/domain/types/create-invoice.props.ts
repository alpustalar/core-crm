import { InvoiceStatus, Prisma } from '@prisma/client';

export interface CreateInvoiceProps {
  id: string;
  clinicId: string;
  patientId: string;
  appointmentId: string | null;
  paymentId: string | null;
  amount: number;
  currency: string;
  vatRate: number;
  netTotal: Prisma.Decimal;
  vatTotal: Prisma.Decimal;
  status: InvoiceStatus;
  invoiceNumber?: string;
  issuedAt?: Date;
  providerRef?: string;
  rawResponse?: unknown;
}

import { QueryResponse } from '@shared/common/response/response.interface';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { InvoiceStatusType as InvoiceStatus } from '@input-type-schemas/InvoiceStatusSchema';

export interface InvoiceView {
  id: string;
  clinicId: string;
  patientId: string;
  netTotal: string;
  vatTotal: string;
  grandTotal: string;
  vatRate: number;
  currency: CurrencyType;
  issuedAt: Date | null;
  status: InvoiceStatus;
}

export type GetInvoiceByIdResponse = QueryResponse<InvoiceView | null>;

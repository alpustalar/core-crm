import { QueryResponse } from '@shared/common/response/response.interface';

export interface PurchaseInvoiceListItem {
  id: string;
  supplierId: string;
  invoiceNumber: string | null;
  invoiceDate: Date;
  lineAccountCode: string;
  vatRate: number;
  netTotal: string;
  vatTotal: string;
  grandTotal: string;
  currency: string;
  status: string;
}

export type GetPurchaseInvoicesResponse = QueryResponse<{
  items: PurchaseInvoiceListItem[];
  total: number;
}>;

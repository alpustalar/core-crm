import { Decimal } from 'decimal.js';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export interface CreatePurchaseInvoiceProps {
  id: string;
  clinicId: string;
  organizationId: string;
  supplierId: string;
  invoiceNumber: string | null;
  invoiceDate: Date;
  lineAccountCode: string;
  vatRate: number;
  netTotal: Decimal;
  vatTotal: Decimal;
  grandTotal: Decimal;
  currency: CurrencyType;
}

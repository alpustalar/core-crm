import { Pagination } from '@shared';
import { PurchaseInvoice } from '../entities/purchase-invoice.entity';

export const PURCHASE_INVOICE_COMMAND_REPOSITORY = Symbol(
  'IPurchaseInvoiceCommandRepository'
);
export const PURCHASE_INVOICE_QUERY_REPOSITORY = Symbol(
  'IPurchaseInvoiceQueryRepository'
);

export interface IPurchaseInvoiceCommandRepository {
  save(entity: PurchaseInvoice): Promise<PurchaseInvoice>;
}

export interface IPurchaseInvoiceQueryRepository {
  findById(id: string): Promise<PurchaseInvoice | null>;
  findManyByClinic(
    clinicId: string,
    pagination: Pagination
  ): Promise<{ items: PurchaseInvoice[]; total: number }>;
}

import { Pagination } from '@shared';
import { PurchaseInvoice } from '../entities/purchase-invoice.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const PURCHASE_INVOICE_COMMAND_REPOSITORY = Symbol(
  'IPurchaseInvoiceCommandRepository'
);
export const PURCHASE_INVOICE_QUERY_REPOSITORY = Symbol(
  'IPurchaseInvoiceQueryRepository'
);

export type IPurchaseInvoiceCommandRepository =
  IBaseCommandRepository<PurchaseInvoice>;

export interface IPurchaseInvoiceQueryRepository {
  findById(id: string): Promise<PurchaseInvoice | null>;
  findManyByClinic(
    clinicId: string,
    pagination: Pagination
  ): Promise<{ items: PurchaseInvoice[]; total: number }>;
}

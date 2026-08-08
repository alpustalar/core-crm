import { Pagination } from '@shared';
import { PurchaseInvoice as IPurchaseInvoice } from '@shared';
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

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IPurchaseInvoiceQueryRepository {
  findManyByClinic(
    clinicId: string,
    pagination: Pagination
  ): Promise<{ items: IPurchaseInvoice[]; total: number }>;
}

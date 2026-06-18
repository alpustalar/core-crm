import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import {
  IPurchaseInvoiceQueryRepository,
  PURCHASE_INVOICE_QUERY_REPOSITORY,
} from '@modules/finance/purchase-invoice/domain/repositories/purchase-invoice.repository';
import { GetPurchaseInvoicesQuery } from './get-purchase-invoices.query';
import { GetPurchaseInvoicesResponse } from './get-purchase-invoices.response';

@QueryHandler(GetPurchaseInvoicesQuery)
export class GetPurchaseInvoicesHandler
  implements IQueryHandler<GetPurchaseInvoicesQuery, GetPurchaseInvoicesResponse>
{
  constructor(
    @Inject(PURCHASE_INVOICE_QUERY_REPOSITORY)
    private readonly purchaseInvoiceQueryRepo: IPurchaseInvoiceQueryRepository
  ) {}

  async execute(
    query: GetPurchaseInvoicesQuery
  ): Promise<GetPurchaseInvoicesResponse> {
    const clinicId = query.ctx.actor.clinicId;
    if (!clinicId) {
      throw new BadRequestException('Aktörün clinic bağlamı yok.');
    }

    const { items, total } =
      await this.purchaseInvoiceQueryRepo.findManyByClinic(
        clinicId,
        query.pagination
      );

    return {
      data: {
        items: items.map((invoice) => ({
          id: invoice.id,
          supplierId: invoice.supplierId,
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          lineAccountCode: invoice.lineAccountCode,
          vatRate: invoice.vatRate,
          netTotal: invoice.netTotal.toFixed(2),
          vatTotal: invoice.vatTotal.toFixed(2),
          grandTotal: invoice.grandTotal.toFixed(2),
          currency: invoice.currency,
          status: invoice.status,
        })),
        total,
      },
    };
  }
}

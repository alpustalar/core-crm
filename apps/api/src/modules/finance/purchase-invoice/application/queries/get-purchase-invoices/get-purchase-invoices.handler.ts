import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  IPurchaseInvoiceQueryRepository,
  PURCHASE_INVOICE_QUERY_REPOSITORY,
} from '@modules/finance/purchase-invoice/domain/repositories/purchase-invoice.repository';
import { GetPurchaseInvoicesQuery } from './get-purchase-invoices.query';
import { GetPurchaseInvoicesResponse } from './get-purchase-invoices.response';
import { ClinicNotAssignedException } from '@src/domain/exceptions/clinic-not-assigned.exception';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

@QueryHandler(GetPurchaseInvoicesQuery)
export class GetPurchaseInvoicesHandler
  implements
    IQueryHandler<GetPurchaseInvoicesQuery, GetPurchaseInvoicesResponse>
{
  constructor(
    @Inject(PURCHASE_INVOICE_QUERY_REPOSITORY)
    private readonly purchaseInvoiceQueryRepo: IPurchaseInvoiceQueryRepository
  ) {}

  async execute(
    query: GetPurchaseInvoicesQuery
  ): Promise<GetPurchaseInvoicesResponse> {
    const clinicId = query.ctx.actor.clinicId;
    if (!clinicId) throw new ClinicNotAssignedException();

    const { items, total } =
      await this.purchaseInvoiceQueryRepo.findManyByClinic(
        clinicId,
        query.pagination
      );

    return {
      data: items.map((invoice) => invoice.toPersistence()),
      meta: {
        pagination: buildPaginationMeta(query.pagination, total),
      },
    };
  }
}

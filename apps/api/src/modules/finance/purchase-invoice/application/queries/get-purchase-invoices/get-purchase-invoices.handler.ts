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
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetPurchaseInvoicesQuery)
export class GetPurchaseInvoicesHandler implements IQueryHandler<
  GetPurchaseInvoicesQuery,
  GetPurchaseInvoicesResponse
> {
  constructor(
    @Inject(PURCHASE_INVOICE_QUERY_REPOSITORY)
    private readonly purchaseInvoiceQueryRepo: IPurchaseInvoiceQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetPurchaseInvoicesQuery
  ): Promise<GetPurchaseInvoicesResponse> {
    const clinicId = query.ctx.actor.clinicId;
    if (!clinicId) throw new ClinicNotAssignedException();

    const { evaluator, policy } = this.policyFactory.finance(
      query.ctx.actor,
      query.ctx.source
    );

    evaluator
      .check(
        (p) => p.canAccessClinicFinances(clinicId),
        'Bu kliniğin alış faturalarına erişim yetkiniz yok.'
      )
      .orThrow('purchase-invoice.list');

    const { items, total } =
      await this.purchaseInvoiceQueryRepo.findManyByClinic(
        clinicId,
        query.pagination
      );

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(query.pagination, total),
        serializationOptions: policy.getSerializationOptions({ clinicId }),
      },
    };
  }
}

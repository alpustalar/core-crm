import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindSuppliersQuery } from './find-suppliers.query';
import { FindSuppliersResponse } from './find-suppliers.response';
import {
  ISupplierQueryRepository,
  SUPPLIER_QUERY_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/supplier.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

@QueryHandler(FindSuppliersQuery)
export class FindSuppliersHandler
  implements IQueryHandler<FindSuppliersQuery, FindSuppliersResponse>
{
  constructor(
    @Inject(SUPPLIER_QUERY_REPOSITORY)
    private readonly supplierQueryRepo: ISupplierQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: FindSuppliersQuery): Promise<FindSuppliersResponse> {
    const { pagination, ctx } = query;
    const { actor } = ctx;

    this.policyFactory
      .organization(actor)
      .evaluator.check(
        (p) => p.isOwnOrganization(),
        'Tedarikçi listeleme yetkiniz yok.'
      )
      .orThrow();

    const result = await this.supplierQueryRepo.findMany(
      actor.organizationId!,
      pagination
    );

    return {
      data: result.items,
      meta: {
        pagination: buildPaginationMeta(pagination, result.total),
      },
    };
  }
}

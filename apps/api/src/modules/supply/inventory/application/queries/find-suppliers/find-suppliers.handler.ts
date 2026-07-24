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
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
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
    const { payload } = query;
    const { pagination, ctx, organizationId } = payload;

    const result = await this.supplierQueryRepo.findMany(
      organizationId,
      pagination
    );

    return {
      data: result.items.map((item) => item.toPersistence()),
      meta: {
        pagination: buildPaginationMeta(pagination, result.total),
      },
    };
  }
}

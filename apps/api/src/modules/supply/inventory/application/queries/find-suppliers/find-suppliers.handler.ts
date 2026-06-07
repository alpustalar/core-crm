import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject } from '@nestjs/common';
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

    const { policy } = this.policyFactory.organization(actor);
    if (
      !policy.isSystemAdmin() &&
      !policy.isOwnOrganization(actor.organizationId)
    ) {
      throw new ForbiddenException('Tedarikçi listeleme yetkiniz yok.');
    }

    const result = await this.supplierQueryRepo.findMany(
      actor.organizationId!,
      pagination
    );

    return { data: result };
  }
}

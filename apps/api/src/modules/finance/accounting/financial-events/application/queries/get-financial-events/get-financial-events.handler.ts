import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { GetFinancialEventsQuery } from './get-financial-events.query';
import { GetFinancialEventsResponse } from './get-financial-events.response';
import {
  FINANCIAL_EVENT_QUERY_REPOSITORY,
  IFinancialEventQueryRepository,
} from '@modules/finance/accounting/financial-events/domain/repositories/financial-event/financial-event.query.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  ITenantScopeResolver,
  TENANT_SCOPE_RESOLVER,
} from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';

@QueryHandler(GetFinancialEventsQuery)
export class GetFinancialEventsHandler
  implements IQueryHandler<GetFinancialEventsQuery, GetFinancialEventsResponse>
{
  constructor(
    @Inject(FINANCIAL_EVENT_QUERY_REPOSITORY)
    private readonly financialEventRepo: IFinancialEventQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver
  ) {}

  async execute(
    query: GetFinancialEventsQuery
  ): Promise<GetFinancialEventsResponse> {
    const { pagination, type, sourceModule, sourceRefId, ctx } = query.payload;

    const organizationId = await this.tenantScopeResolver.resolve(
      query.payload
    );

    const { items, total } = await this.financialEventRepo.findMany(
      { organizationId, type, sourceModule, sourceRefId },
      pagination
    );

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(pagination, total),
        serializationOptions: this.policyFactory
          .finance(ctx.actor, ctx.source)
          .policy.getOrganizationSerializationOptions({
            organizationId,
          }),
      },
    };
  }
}

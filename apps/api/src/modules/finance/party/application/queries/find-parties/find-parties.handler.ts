import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { FindPartiesQuery } from './find-parties.query';
import { FindPartiesResponse } from './find-parties.response';
import {
  IPartyQueryRepository,
  PARTY_QUERY_REPOSITORY,
} from '@modules/finance/party/domain/repositories/party/party.query.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  ITenantScopeResolver,
  TENANT_SCOPE_RESOLVER,
} from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';

@QueryHandler(FindPartiesQuery)
export class FindPartiesHandler
  implements IQueryHandler<FindPartiesQuery, FindPartiesResponse>
{
  constructor(
    @Inject(PARTY_QUERY_REPOSITORY)
    private readonly partyRepo: IPartyQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver
  ) {}

  async execute(query: FindPartiesQuery): Promise<FindPartiesResponse> {
    const { clinicId, pagination, role, ctx } = query;

    const { evaluator, policy } = this.policyFactory.finance(
      ctx.actor,
      ctx.source
    );

    const organizationId = await this.tenantScopeResolver.resolve({
      clinicId,
    });

    evaluator
      .check(
        (p) => p.canAccessClinicFinances(clinicId),
        'Bu organizasyonun cari taraflarına erişim yetkiniz yok.'
      )
      .orThrow('party.list');

    const { items, total } = await this.partyRepo.findMany(
      { organizationId, role },
      pagination
    );

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(pagination, total),
        serializationOptions: policy.getOrganizationSerializationOptions({
          organizationId,
        }),
      },
    };
  }
}

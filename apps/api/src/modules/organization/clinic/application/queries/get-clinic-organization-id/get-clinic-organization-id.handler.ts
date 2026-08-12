import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicOrganizationIdQuery } from './get-clinic-organization-id.query';
import { GetClinicOrganizationIdResponse } from './get-clinic-organization-id.response';
import {
  ITenantScopeResolver,
  TENANT_SCOPE_RESOLVER,
} from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';

/**
 * Bus üzerinden erişim için ince kabuk — çözümleme mantığı TENANT_SCOPE_RESOLVER'da.
 * Aynı süreçteki handler'lar doğrudan çözücüyü inject etmelidir.
 */
@QueryHandler(GetClinicOrganizationIdQuery)
export class GetClinicOrganizationIdHandler
  implements
    IQueryHandler<
      GetClinicOrganizationIdQuery,
      GetClinicOrganizationIdResponse
    >
{
  constructor(
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver
  ) {}

  async execute(
    query: GetClinicOrganizationIdQuery
  ): Promise<GetClinicOrganizationIdResponse> {
    return {
      data: await this.tenantScopeResolver.resolve({
        clinicId: query.clinicId,
      }),
    };
  }
}

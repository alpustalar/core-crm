import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOrganizationIdByClinicIdQuery } from './find-organization-id-by-clinic-id.query';
import { FindOrganizationIdByClinicIdQueryResponse } from './find-organization-id-by-clinic-id.response';
import { Inject } from '@nestjs/common';
import { OrganizationNotFoundException } from '@modules/organization/organization/domain/exceptions/organization.exceptions';
import {
  IOrganizationQueryRepository,
  ORGANIZATION_QUERY_REPOSITORY,
} from '@modules/organization/organization/domain/repositories/organization/organization.query.repository';
import {
  IOrganizationCacheService,
  ORGANIZATION_CACHE_SERVICE,
} from '@modules/organization/organization/domain/interfaces/organization-cache.service.interface';

@QueryHandler(FindOrganizationIdByClinicIdQuery)
export class FindOrganizationIdByClinicIdHandler
  implements
    IQueryHandler<
      FindOrganizationIdByClinicIdQuery,
      FindOrganizationIdByClinicIdQueryResponse
    >
{
  constructor(
    @Inject(ORGANIZATION_QUERY_REPOSITORY)
    private readonly organizationRepo: IOrganizationQueryRepository,
    @Inject(ORGANIZATION_CACHE_SERVICE)
    private readonly cacheService: IOrganizationCacheService
  ) {}

  async execute(
    query: FindOrganizationIdByClinicIdQuery
  ): Promise<FindOrganizationIdByClinicIdQueryResponse> {
    const { clinicId } = query;

    const result = await this.cacheService
      .organizationIdByClinicId()
      .get(clinicId);

    if (result) return { organizationId: result.organizationId };

    const organizationId =
      await this.organizationRepo.findIdByClinicId(clinicId);

    if (!organizationId) throw new OrganizationNotFoundException();

    await this.cacheService
      .organizationIdByClinicId()
      .set(clinicId, { organizationId });

    return { organizationId };
  }
}

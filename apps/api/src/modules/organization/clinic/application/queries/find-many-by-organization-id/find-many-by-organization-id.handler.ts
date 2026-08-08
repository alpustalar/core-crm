import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindManyByOrganizationIdQuery } from './find-many-by-organization-id.query';
import { Inject } from '@nestjs/common';

import { FindManyByOrganizationIdQueryResponse } from '@modules/organization/clinic/application/queries/find-many-by-organization-id/find-many-by-organization-id.response';
import {
  CLINIC_QUERY_REPOSITORY,
  IClinicQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic/clinic.query.repository';

@QueryHandler(FindManyByOrganizationIdQuery)
export class FindManyByOrganizationIdHandler
  implements
    IQueryHandler<
      FindManyByOrganizationIdQuery,
      FindManyByOrganizationIdQueryResponse
    >
{
  constructor(
    @Inject(CLINIC_QUERY_REPOSITORY)
    private readonly clinicRepo: IClinicQueryRepository
  ) {}

  async execute(
    query: FindManyByOrganizationIdQuery
  ): Promise<FindManyByOrganizationIdQueryResponse> {
    const { organizationId } = query;
    const clinics =
      await this.clinicRepo.findManyByOrganizationId(organizationId);

    return {
      data: clinics,
    };
  }
}

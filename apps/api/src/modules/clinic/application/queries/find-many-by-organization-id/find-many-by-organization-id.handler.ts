import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindManyByOrganizationIdQuery } from './find-many-by-organization-id.query';
import { Inject } from '@nestjs/common';
import {
  CLINIC_QUERY_REPOSITORY,
  IClinicQueryRepository,
} from '@modules/clinic/domain/repositories/clinic.repository.interface';
import { FindManyByOrganizationIdQueryResponse } from '@modules/clinic/application/queries/find-many-by-organization-id/find-many-by-organization-id.response';

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
    private readonly clinicQueryRepo: IClinicQueryRepository
  ) {}

  async execute(
    query: FindManyByOrganizationIdQuery
  ): Promise<FindManyByOrganizationIdQueryResponse> {
    const { organizationId } = query;
    const clinicsRaw =
      await this.clinicQueryRepo.findManyByOrganizationId(organizationId);

    return {
      data: clinicsRaw,
    };
  }
}

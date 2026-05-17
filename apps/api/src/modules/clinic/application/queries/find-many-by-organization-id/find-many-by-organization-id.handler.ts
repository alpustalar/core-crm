import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindManyByOrganizationIdQuery } from './find-many-by-organization-id.query';
import { Inject } from '@nestjs/common';
import {
  CLINIC_REPO_TOKEN,
  IClinicRepository,
} from '@modules/clinic/domain/repositories/clinic.repository.interface';
import { QueryResponse } from '@shared/common/response/response.interface';
import { Clinic } from '@prisma/client';

@QueryHandler(FindManyByOrganizationIdQuery)
export class FindManyByOrganizationIdHandler
  implements
    IQueryHandler<
      FindManyByOrganizationIdQuery,
      QueryResponse<Clinic[] | null>
    >
{
  constructor(
    @Inject(CLINIC_REPO_TOKEN)
    private readonly clinicRepo: IClinicRepository
  ) {}

  async execute(
    query: FindManyByOrganizationIdQuery
  ): Promise<QueryResponse<Clinic[] | null>> {
    const { organizationId } = query;
    const clinicsRaw =
      await this.clinicRepo.findManyByOrganizationId(organizationId);

    return {
      data: clinicsRaw,
    };
  }
}

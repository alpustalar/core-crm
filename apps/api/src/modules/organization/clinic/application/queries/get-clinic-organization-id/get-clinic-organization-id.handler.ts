import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicOrganizationIdQuery } from './get-clinic-organization-id.query';
import { GetClinicOrganizationIdResponse } from './get-clinic-organization-id.response';
import {
  CLINIC_QUERY_REPOSITORY,
  IClinicQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic.repository.interface';

@QueryHandler(GetClinicOrganizationIdQuery)
export class GetClinicOrganizationIdHandler
  implements
    IQueryHandler<GetClinicOrganizationIdQuery, GetClinicOrganizationIdResponse>
{
  constructor(
    @Inject(CLINIC_QUERY_REPOSITORY)
    private readonly clinicQueryRepo: IClinicQueryRepository
  ) {}

  async execute(
    query: GetClinicOrganizationIdQuery
  ): Promise<GetClinicOrganizationIdResponse> {
    const clinic = await this.clinicQueryRepo.findById(query.clinicId);
    if (!clinic) {
      throw new Error(`Klinik bulunamadı: ${query.clinicId}`);
    }
    return { data: clinic.organizationId.value };
  }
}

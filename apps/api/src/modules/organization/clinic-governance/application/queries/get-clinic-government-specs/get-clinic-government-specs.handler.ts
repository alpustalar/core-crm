import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetClinicGovernmentSpecsQuery } from './get-clinic-government-specs.query';
import { GetClinicGovernmentSpecsResponse } from './get-clinic-government-specs.response';
import {
  CLINIC_GOVERNMENT_SPECS_QUERY_REPOSITORY,
  IClinicGovernmentSpecsQueryRepository,
} from '@modules/organization/clinic-governance/domain/repositories/clinic-government-specs.repository';

@QueryHandler(GetClinicGovernmentSpecsQuery)
export class GetClinicGovernmentSpecsHandler
  implements
    IQueryHandler<
      GetClinicGovernmentSpecsQuery,
      GetClinicGovernmentSpecsResponse
    >
{
  constructor(
    @Inject(CLINIC_GOVERNMENT_SPECS_QUERY_REPOSITORY)
    private readonly specsQueryRepo: IClinicGovernmentSpecsQueryRepository
  ) {}

  async execute(
    query: GetClinicGovernmentSpecsQuery
  ): Promise<GetClinicGovernmentSpecsResponse> {
    const specs = await this.specsQueryRepo.findByClinicId(query.clinicId);
    if (!specs) return { data: null };

    return {
      data: {
        clinicId: specs.clinicId,
        healthFacilityCode: specs.healthFacilityCode,
        ussPassword: specs.ussPassword,
        companyTaxNumber: specs.companyTaxNumber?.value ?? null,
        legalType: specs.legalType,
        createdAt: specs.createdAt,
        updatedAt: specs.updatedAt,
      },
    };
  }
}

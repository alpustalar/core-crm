import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindPatientPackagesQuery } from './find-patient-packages.query';
import type { FindPatientPackagesResponse } from './find-patient-packages.response';
import {
  IPatientTreatmentPackageQueryRepository,
  PATIENT_TREATMENT_PACKAGE_QUERY_REPO,
} from '@modules/treatment-package/domain/repositories/patient-treatment-package.repository.interface';
import { PaginationSchema } from '@shared';

@QueryHandler(FindPatientPackagesQuery)
export class FindPatientPackagesHandler
  implements
    IQueryHandler<FindPatientPackagesQuery, FindPatientPackagesResponse>
{
  constructor(
    @Inject(PATIENT_TREATMENT_PACKAGE_QUERY_REPO)
    private readonly patientPackageQueryRepo: IPatientTreatmentPackageQueryRepository
  ) {}

  async execute(
    query: FindPatientPackagesQuery
  ): Promise<FindPatientPackagesResponse> {
    const { dto } = query;

    const pagination = PaginationSchema.parse({
      page: dto.page,
      limit: dto.limit,
    });

    return this.patientPackageQueryRepo.findManyByPatient(
      dto.patientId ?? '',
      pagination,
      dto.status
    );
  }
}

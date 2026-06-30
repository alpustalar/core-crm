import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindPatientPackagesQuery } from './find-patient-packages.query';
import type { FindPatientPackagesResponse } from './find-patient-packages.response';
import {
  IPatientTreatmentPackageQueryRepository,
  PATIENT_TREATMENT_PACKAGE_QUERY_REPO,
} from '@modules/clinical/treatment-package/domain/repositories/patient-treatment-package.repository.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

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

    const { items: patientTreatmentPackages, total } =
      await this.patientPackageQueryRepo.findManyByPatient(
        dto.patientId ?? '',
        dto.pagination,
        dto.status
      );

    return {
      data: patientTreatmentPackages.map((patientTreatmentPackage) =>
        patientTreatmentPackage.toPersistence()
      ),
      meta: {
        pagination: buildPaginationMeta(dto.pagination, total),
      },
    };
  }
}

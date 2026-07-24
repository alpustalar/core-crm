import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindPatientPackagesQuery } from './find-patient-packages.query';
import type { FindPatientPackagesResponse } from './find-patient-packages.response';
import {
  IPatientTreatmentPackageQueryRepository,
  PATIENT_TREATMENT_PACKAGE_QUERY_REPO,
} from '@modules/clinical/treatment-package/domain/repositories/patient-treatment-package.repository.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

@QueryHandler(FindPatientPackagesQuery)
export class FindPatientPackagesHandler
  implements
    IQueryHandler<FindPatientPackagesQuery, FindPatientPackagesResponse>
{
  constructor(
    @Inject(PATIENT_TREATMENT_PACKAGE_QUERY_REPO)
    private readonly patientPackageQueryRepo: IPatientTreatmentPackageQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    query: FindPatientPackagesQuery
  ): Promise<FindPatientPackagesResponse> {
    const { filter, ctx } = query;

    const { items: patientTreatmentPackages, total } =
      await this.patientPackageQueryRepo.findManyByPatient(
        filter.patientId ?? '',
        filter.pagination,
        filter.status
      );

    return {
      data: patientTreatmentPackages.map((patientTreatmentPackage) =>
        patientTreatmentPackage.toPersistence()
      ),
      meta: {
        pagination: buildPaginationMeta(filter.pagination, total),
      },
    };
  }
}

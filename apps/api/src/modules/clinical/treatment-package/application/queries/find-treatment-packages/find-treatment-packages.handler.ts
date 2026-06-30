import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindTreatmentPackagesQuery } from './find-treatment-packages.query';
import type { FindTreatmentPackagesResponse } from './find-treatment-packages.response';
import {
  ITreatmentPackageQueryRepository,
  TREATMENT_PACKAGE_QUERY_REPO,
} from '@modules/clinical/treatment-package/domain/repositories/treatment-package.repository.interface';
import { ClinicNotAssignedException } from '@src/domain/exceptions/clinic-not-assigned.exception';

@QueryHandler(FindTreatmentPackagesQuery)
export class FindTreatmentPackagesHandler
  implements
    IQueryHandler<FindTreatmentPackagesQuery, FindTreatmentPackagesResponse>
{
  constructor(
    @Inject(TREATMENT_PACKAGE_QUERY_REPO)
    private readonly treatmentPackageQueryRepo: ITreatmentPackageQueryRepository
  ) {}

  async execute(
    query: FindTreatmentPackagesQuery
  ): Promise<FindTreatmentPackagesResponse> {
    const { dto, ctx } = query;
    const { actor } = ctx;

    if (!actor.clinicId) throw new ClinicNotAssignedException();

    return this.treatmentPackageQueryRepo.findMany(
      actor.clinicId,
      dto.pagination,
      dto.isActive
    );
  }
}

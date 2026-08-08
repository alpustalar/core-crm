import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindTreatmentPackagesQuery } from './find-treatment-packages.query';
import type { FindTreatmentPackagesResponse } from './find-treatment-packages.response';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  ITreatmentPackageQueryRepository,
  TREATMENT_PACKAGE_QUERY_REPO,
} from '@modules/clinical/treatment-package/domain/repositories/treatment-package/treatment-package.query.repository';

@QueryHandler(FindTreatmentPackagesQuery)
export class FindTreatmentPackagesHandler
  implements
    IQueryHandler<FindTreatmentPackagesQuery, FindTreatmentPackagesResponse>
{
  constructor(
    @Inject(TREATMENT_PACKAGE_QUERY_REPO)
    private readonly treatmentPackageRepo: ITreatmentPackageQueryRepository
  ) {}

  async execute(
    query: FindTreatmentPackagesQuery
  ): Promise<FindTreatmentPackagesResponse> {
    const { filter, ctx } = query;

    const { items, total } = await this.treatmentPackageRepo.findMany(
      filter.clinicId,
      filter.pagination,
      filter.isActive
    );

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(filter.pagination, total),
      },
    };
  }
}

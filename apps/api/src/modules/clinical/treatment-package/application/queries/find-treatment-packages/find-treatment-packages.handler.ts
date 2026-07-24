import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindTreatmentPackagesQuery } from './find-treatment-packages.query';
import type { FindTreatmentPackagesResponse } from './find-treatment-packages.response';
import {
  ITreatmentPackageQueryRepository,
  TREATMENT_PACKAGE_QUERY_REPO,
} from '@modules/clinical/treatment-package/domain/repositories/treatment-package.repository.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

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
    const { filter, ctx } = query;

    const { items, total } = await this.treatmentPackageQueryRepo.findMany(
      filter.clinicId,
      filter.pagination,
      filter.isActive
    );

    return {
      data: items.map((item) => {
        const persistenceData = item.toPersistence();
        const relations = {
          items: item.items,
          providers: item.providers,
        };
        return {
          ...persistenceData,
          ...relations,
        };
      }),
      meta: {
        pagination: buildPaginationMeta(filter.pagination, total),
      },
    };
  }
}

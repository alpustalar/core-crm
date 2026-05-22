import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { FindTreatmentPackagesQuery } from './find-treatment-packages.query';
import type { FindTreatmentPackagesResponse } from './find-treatment-packages.response';
import {
  ITreatmentPackageQueryRepository,
  TREATMENT_PACKAGE_QUERY_REPO,
} from '@modules/treatment-package/domain/repositories/treatment-package.repository.interface';
import { PaginationSchema } from '@shared';

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

    if (!actor.clinicId)
      throw new BadRequestException('Actor için klinik tanımlanmamış.');

    const pagination = PaginationSchema.parse({
      page: dto.page,
      limit: dto.limit,
    });

    return this.treatmentPackageQueryRepo.findMany(
      actor.clinicId,
      pagination,
      dto.isActive
    );
  }
}

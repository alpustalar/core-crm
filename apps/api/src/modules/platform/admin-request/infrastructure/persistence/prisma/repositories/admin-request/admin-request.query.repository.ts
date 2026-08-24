import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { AdminRequest as IAdminRequest } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { FindAdminRequestsFilter } from '@modules/platform/admin-request/domain/contracts/admin-request';
import { IAdminRequestQueryRepository } from '@modules/platform/admin-request/domain/repositories/admin-request/admin-request.query.repository';

/** Okuma tarafı: entity hidrate edilmez (veri doğrudan HTTP sınırını geçiyor). */
@Injectable()
export class AdminRequestQueryRepository
  extends BaseRepository
  implements IAdminRequestQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findMany(
    filter: FindAdminRequestsFilter
  ): Promise<{ items: IAdminRequest[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (filter.type) where.type = filter.type;
    if (filter.status) where.status = filter.status;
    if (filter.organizationId) where.organizationId = filter.organizationId;

    return paginate({
      delegate: this.db.adminRequest,
      pagination: filter.pagination,
      where,
    });
  }
}

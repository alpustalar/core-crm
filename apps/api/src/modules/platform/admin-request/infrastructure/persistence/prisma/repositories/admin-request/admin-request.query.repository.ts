import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IAdminRequestQueryRepository } from '@modules/platform/admin-request/domain/repositories/admin-request.repository.interface';
import { AdminRequest } from '@modules/platform/admin-request/domain/entities/admin-request.entity';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { FindAdminRequestsFilter } from '@modules/platform/admin-request/domain/admin-request.contracts';

@Injectable()
export class AdminRequestQueryRepository
  extends BaseRepository
  implements IAdminRequestQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<AdminRequest | null> {
    const raw = await this.db.adminRequest.findUnique({ where: { id } });
    return raw ? new AdminRequest(raw) : null;
  }

  async findMany(
    filter: FindAdminRequestsFilter
  ): Promise<{ items: AdminRequest[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (filter.type) where.type = filter.type;
    if (filter.status) where.status = filter.status;
    if (filter.organizationId) where.organizationId = filter.organizationId;

    const result = await paginate({
      delegate: this.db.adminRequest,
      pagination: filter.pagination,
      where,
    });

    return {
      items: result.items.map((r) => new AdminRequest(r)),
      total: result.total,
    };
  }
}

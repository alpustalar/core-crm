import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { Pagination } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IProviderRepository } from '@modules/provider/domain/repositories/provider.repository.interface';

@Injectable()
export class ProviderRepository
  extends BaseRepository
  implements IProviderRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }
  create(data: Prisma.ProviderCreateInput) {
    return this.db.provider.create({ data });
  }

  findById(providerId: string) {
    return this.db.provider.findUnique({ where: { id: providerId } });
  }

  findAllByClinicId(pagination: Pagination, clinicId: string) {
    return paginate({
      delegate: this.db.provider,
      pagination,
      where: { clinicId },
    });
  }

  findAllByOrganizationIds(pagination: Pagination, organizationIds: string[]) {
    return paginate({
      delegate: this.db.provider,
      pagination,
      where: { clinic: { organizationId: { in: organizationIds } } },
    });
  }

  update(providerId: string, data: Prisma.ProviderUpdateInput) {
    return this.db.provider.update({ where: { id: providerId }, data });
  }
}

import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { Pagination } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IProviderRepository } from '@modules/provider/domain/repositories/provider.repository.interface';
import { ProviderPersistenceMapper } from '@modules/provider/infrastructure/persistence/prisma/mappers/provider-persistence.mapper';
import { ConvertUserToProviderDto } from '@shared/modules/provider/dto/convert-user-to-provider.dto';
import { UpdateProviderDto } from '@shared/modules/provider/dto/update-provider.dto';

@Injectable()
export class ProviderRepository
  extends BaseRepository
  implements IProviderRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }
  create(data: ConvertUserToProviderDto) {
    const toPersistence = ProviderPersistenceMapper.toCreate(data);
    return this.db.provider.create({ data: toPersistence });
  }

  find(providerId: string) {
    return this.db.provider.findUnique({ where: { id: providerId } });
  }

  async findAllByClinicId(pagination: Pagination, clinicId: string) {
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

  update(providerId: string, data: UpdateProviderDto) {
    const toPersistence = ProviderPersistenceMapper.toUpdate(data);
    return this.db.provider.update({
      where: { id: providerId },
      data: toPersistence,
    });
  }
}

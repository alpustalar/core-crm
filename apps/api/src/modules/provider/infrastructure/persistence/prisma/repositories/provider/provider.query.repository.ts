import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { Pagination } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import {
  IProviderQueryRepository,
  PaginatedProviders,
} from '@modules/provider/domain/repositories/provider.repository.interface';
import { Provider } from '@modules/provider/domain/entities/provider.entity';

@Injectable()
export class ProviderQueryRepository extends BaseRepository implements IProviderQueryRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(providerId: string): Promise<Provider | null> {
    const raw = await this.db.provider.findUnique({ where: { id: providerId } });
    return raw ? new Provider(raw) : null;
  }

  async findAllByClinicId(pagination: Pagination, clinicId: string): Promise<PaginatedProviders> {
    const result = await paginate({ delegate: this.db.provider, pagination, where: { clinicId } });
    return { items: result.items.map((r) => new Provider(r)), total: result.total };
  }

  async findAllByOrganizationIds(pagination: Pagination, organizationIds: string[]): Promise<PaginatedProviders> {
    const result = await paginate({
      delegate: this.db.provider,
      pagination,
      where: { clinic: { organizationId: { in: organizationIds } } },
    });
    return { items: result.items.map((r) => new Provider(r)), total: result.total };
  }
}

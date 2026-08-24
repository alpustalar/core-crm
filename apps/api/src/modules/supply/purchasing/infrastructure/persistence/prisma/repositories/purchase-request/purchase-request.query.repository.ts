import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IPurchaseRequestQueryRepository } from '@modules/supply/purchasing/domain/repositories/purchase-request.repository';
import {
  FindPurchaseRequestsFilter,
  PurchaseRequestWithItems,
} from '@modules/supply/purchasing/domain/contracts';
import { Paginated } from '@common/interfaces/paginated.type';

@Injectable()
export class PurchaseRequestQueryRepository
  extends BaseRepository
  implements IPurchaseRequestQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<PurchaseRequestWithItems | null> {
    const raw = await this.db.purchaseRequest.findUnique({
      where: { id },
      include: { items: true },
    });
    return raw ? (raw as unknown as PurchaseRequestWithItems) : null;
  }

  async findByClinic(
    filter: FindPurchaseRequestsFilter
  ): Promise<Paginated<PurchaseRequestWithItems>> {
    const where: Record<string, unknown> = { clinicId: filter.clinicId };
    if (filter.status) where.status = filter.status;

    const result = await paginate({
      delegate: this.db.purchaseRequest,
      pagination: filter.pagination,
      where,
      include: { items: true },
    });

    return {
      items: result.items as unknown as PurchaseRequestWithItems[],
      total: result.total,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { Pagination } from '@shared';
import { IStockMovementQueryRepository } from '@modules/inventory/domain/repositories/stock-movement.repository.interface';
import { StockMovement } from '@modules/inventory/domain/entities/stock-movement.entity';

@Injectable()
export class StockMovementQueryRepository extends BaseRepository implements IStockMovementQueryRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findManyByClinic(clinicId: string, pagination: Pagination): Promise<{ items: StockMovement[]; total: number }> {
    const result = await paginate({
      delegate: this.db.stockMovement,
      pagination,
      where: { clinicId },
    });
    return { items: result.items.map((r) => new StockMovement(r)), total: result.total };
  }

  async findManyByProduct(productId: string, clinicId: string, pagination: Pagination): Promise<{ items: StockMovement[]; total: number }> {
    const result = await paginate({
      delegate: this.db.stockMovement,
      pagination,
      where: { productId, clinicId },
    });
    return { items: result.items.map((r) => new StockMovement(r)), total: result.total };
  }
}

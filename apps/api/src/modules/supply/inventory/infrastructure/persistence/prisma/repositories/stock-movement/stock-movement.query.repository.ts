import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { Pagination } from '@shared';
import { IStockMovementQueryRepository } from '@modules/supply/inventory/domain/repositories/stock-movement.repository.interface';
import { StockMovement as IStockMovement } from '@shared';

/** Okuma tarafı: entity hidrate edilmez (veri doğrudan HTTP sınırını geçiyor). */
@Injectable()
export class StockMovementQueryRepository
  extends BaseRepository
  implements IStockMovementQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findManyByClinic(
    clinicId: string,
    pagination: Pagination
  ): Promise<{ items: IStockMovement[]; total: number }> {
    return paginate({
      delegate: this.db.stockMovement,
      pagination,
      where: { clinicId },
    });
  }

  findManyByProduct(
    productId: string,
    clinicId: string,
    pagination: Pagination
  ): Promise<{ items: IStockMovement[]; total: number }> {
    return paginate({
      delegate: this.db.stockMovement,
      pagination,
      where: { productId, clinicId },
    });
  }
}

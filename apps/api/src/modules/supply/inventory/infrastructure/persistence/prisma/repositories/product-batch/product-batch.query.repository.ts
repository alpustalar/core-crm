import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IProductBatchQueryRepository } from '@modules/supply/inventory/domain/repositories/product-batch.repository.interface';
import { ProductBatch } from '@modules/supply/inventory/domain/entities/product-batch.entity';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';

@Injectable()
export class ProductBatchQueryRepository
  extends BaseRepository
  implements IProductBatchQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<ProductBatch | null> {
    const raw = await this.db.productBatch.findUnique({ where: { id } });
    return raw ? new ProductBatch(raw) : null;
  }

  async findAvailableByProduct(
    productId: string,
    clinicId: string
  ): Promise<ProductBatch[]> {
    const rows = await this.db.productBatch.findMany({
      where: {
        productId,
        clinicId,
        quantity: { gt: 0 },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: DateTimeManager.create() } },
        ],
      },
      orderBy: { expiresAt: 'asc' },
    });
    return rows.map((r) => new ProductBatch(r));
  }
}

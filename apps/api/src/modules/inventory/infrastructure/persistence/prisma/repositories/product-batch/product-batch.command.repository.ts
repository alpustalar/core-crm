import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IProductBatchCommandRepository } from '@modules/inventory/domain/repositories/product-batch.repository.interface';
import { ProductBatch } from '@modules/inventory/domain/entities/product-batch.entity';

@Injectable()
export class ProductBatchCommandRepository extends BaseRepository implements IProductBatchCommandRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(batch: ProductBatch): Promise<ProductBatch> {
    const data = batch.toPersistence();
    const raw = await this.db.productBatch.upsert({
      where: { id: data.id },
      create: data,
      update: { quantity: data.quantity, updatedAt: new Date() },
    });
    batch.flushEvents();
    return new ProductBatch(raw);
  }
}

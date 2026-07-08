import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IProductBatchCommandRepository } from '@modules/supply/inventory/domain/repositories/product-batch.repository.interface';
import { ProductBatch } from '@modules/supply/inventory/domain/entities/product-batch.entity';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class ProductBatchCommandRepository
  extends BaseCommandRepository<ProductBatch>
  implements IProductBatchCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string) {
    const raw = await this.db.productBatch.findUnique({ where: { id } });
    return raw ? new ProductBatch(raw) : null;
  }

  async create(batch: ProductBatch): Promise<ProductBatch> {
    const data = batch.toPersistence();
    const raw = await this.db.productBatch.create({ data });
    batch.flushEvents();
    return new ProductBatch(raw);
  }

  async save(batch: ProductBatch): Promise<ProductBatch> {
    const create = batch.toPersistence();
    const { id, ...data } = create;
    const raw = await this.db.productBatch.update({
      where: { id },
      data,
    });
    batch.flushEvents();
    return new ProductBatch(raw);
  }

  async saveMany(batches: ProductBatch[]): Promise<void> {
    const prismaQueries = batches.map((batch) => {
      const create = batch.toPersistence();
      const { id, ...data } = create;
      return this.db.productBatch.update({
        where: { id },
        data,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(prismaQueries);
    } else {
      await this.prisma.$transaction(prismaQueries);
    }

    batches.forEach((batch) => batch.flushEvents());
  }
}

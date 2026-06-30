import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IProductCommandRepository } from '@modules/supply/inventory/domain/repositories/product.repository.interface';
import { Product } from '@modules/supply/inventory/domain/entities/product.entity';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class ProductCommandRepository
  extends BaseCommandRepository<Product>
  implements IProductCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string) {
    const raw = await this.db.product.findUnique({ where: { id } });
    return raw ? new Product(raw) : null;
  }

  async save(product: Product): Promise<Product> {
    const create = product.toPersistence();
    const { id, ...update } = create;

    const raw = await this.db.product.upsert({
      where: { id },
      create,
      update,
    });

    product.flushEvents();
    return new Product(raw);
  }

  async saveMany(products: Product[]): Promise<void> {
    const prismaQueries = products.map((product) => {
      const create = product.toPersistence();
      const { id, ...update } = create;
      return this.db.product.upsert({
        where: { id },
        create,
        update,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(prismaQueries);
    } else {
      await this.prisma.$transaction(prismaQueries);
    }

    products.forEach((product) => product.flushEvents());
  }
}

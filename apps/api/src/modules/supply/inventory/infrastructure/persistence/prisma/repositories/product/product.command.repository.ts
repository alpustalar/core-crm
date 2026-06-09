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

  async save(product: Product): Promise<Product> {
    const data = product.toPersistence();

    const raw = await this.db.product.upsert({
      where: { id: product.id },
      create: data,
      update: data,
    });

    product.flushEvents();
    return new Product(raw);
  }

  async saveMany(products: Product[]): Promise<void> {
    const prismaQueries = products.map((product) => {
      const data = product.toPersistence();
      return this.db.product.upsert({
        where: { id: product.id },
        create: data,
        update: data,
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

import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IProductCommandRepository } from '@modules/supply/inventory/domain/repositories/product.repository.interface';
import { Product } from '@modules/supply/inventory/domain/entities/product.entity';

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

  async create(product: Product): Promise<Product> {
    const data = product.toPersistence();
    const raw = await this.db.product.create({ data });
    product.flushEvents();
    return new Product(raw);
  }

  async save(product: Product): Promise<Product> {
    const create = product.toPersistence();
    const { id, ...data } = create;

    const raw = await this.db.product.update({
      where: { id },
      data,
    });

    product.flushEvents();
    return new Product(raw);
  }

  async sync(product: Product): Promise<Product> {
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
}

import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IProductCategoryCommandRepository } from '@modules/supply/inventory/domain/repositories/product-category.repository.interface';
import { ProductCategory } from '@modules/supply/inventory/domain/entities/product-category.entity';

@Injectable()
export class ProductCategoryCommandRepository
  extends BaseCommandRepository<ProductCategory>
  implements IProductCategoryCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(category: ProductCategory): Promise<ProductCategory> {
    const data = category.toPersistence();

    const raw = await this.db.productCategory.create({ data });

    category.flushEvents();

    return new ProductCategory(raw);
  }

  async findById(id: string): Promise<ProductCategory | null> {
    const raw = await this.db.productCategory.findUnique({ where: { id } });
    return raw ? new ProductCategory(raw) : null;
  }

  async update(category: ProductCategory): Promise<ProductCategory> {
    const data = category.toPersistence();

    const raw = await this.db.productCategory.update({
      where: { id: data.id },
      data,
    });

    category.flushEvents();
    return new ProductCategory(raw);
  }
}

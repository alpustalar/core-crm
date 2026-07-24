import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { Pagination } from '@shared';
import { IProductCategoryQueryRepository } from '@modules/supply/inventory/domain/repositories/product-category.repository.interface';
import { ProductCategory } from '@modules/supply/inventory/domain/entities/product-category.entity';

@Injectable()
export class ProductCategoryQueryRepository
  extends BaseRepository
  implements IProductCategoryQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<ProductCategory | null> {
    const raw = await this.db.productCategory.findUnique({ where: { id } });
    return raw ? new ProductCategory(raw) : null;
  }

  async findMany(
    organizationId: string,
    pagination: Pagination
  ): Promise<{ items: ProductCategory[]; total: number }> {
    const result = await paginate({
      delegate: this.db.productCategory,
      pagination,
      where: { organizationId },
    });
    return {
      items: result.items.map((r) => new ProductCategory(r)),
      total: result.total,
    };
  }
}

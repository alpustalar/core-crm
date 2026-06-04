import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IProductCommandRepository } from '@modules/inventory/domain/repositories/product.repository.interface';
import { Product } from '@modules/inventory/domain/entities/product.entity';
import { CreateProductProps } from '@modules/inventory/domain/types/create-product.props';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class ProductCommandRepository
  extends BaseCommandRepository<Product>
  implements IProductCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(props: CreateProductProps): Promise<Product> {
    const raw = await this.db.product.create({
      data: {
        id: props.id,
        name: props.name,
        stockCode: props.stockCode,
        barcode: props.barcode ?? null,
        brand: props.brand ?? null,
        description: props.description ?? null,
        imageUrl: props.imageUrl ?? null,
        unit: props.unit,
        condition: props.condition ?? 'NEW',
        vatRate: props.vatRate ?? new Prisma.Decimal(0),
        criticalStockQty: props.criticalStockQty ?? new Prisma.Decimal(0),
        reorderQty: props.reorderQty ?? new Prisma.Decimal(0),
        organizationId: props.organizationId,
        categoryId: props.categoryId ?? null,
        supplierId: props.supplierId ?? null,
      },
    });
    const product = new Product(raw);
    product.flushEvents();
    return product;
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

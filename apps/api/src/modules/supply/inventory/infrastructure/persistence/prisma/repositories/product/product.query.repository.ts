import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { Pagination } from '@shared';
import { IProductQueryRepository } from '@modules/supply/inventory/domain/repositories/product.repository.interface';
import { Product } from '@modules/supply/inventory/domain/entities/product.entity';

import { Decimal } from 'decimal.js';
import { StockLevel } from '@modules/supply/inventory/domain/contracts/stock-movement.contracts';

@Injectable()
export class ProductQueryRepository
  extends BaseRepository
  implements IProductQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Product | null> {
    const raw = await this.db.product.findFirst({
      where: { id, deletedAt: null },
    });
    return raw ? new Product(raw) : null;
  }

  async findByStockCode(
    stockCode: string,
    organizationId: string
  ): Promise<Product | null> {
    const raw = await this.db.product.findFirst({
      where: { stockCode, organizationId, deletedAt: null },
    });
    return raw ? new Product(raw) : null;
  }

  async findMany(
    organizationId: string,
    pagination: Pagination
  ): Promise<{ items: Product[]; total: number }> {
    const result = await paginate({
      delegate: this.db.product,
      pagination,
      where: { organizationId, deletedAt: null, isActive: true },
    });
    return {
      items: result.items.map((r) => new Product(r)),
      total: result.total,
    };
  }

  async getStockLevels(clinicId: string): Promise<StockLevel[]> {
    const rows = await this.db.productBatch.groupBy({
      by: ['productId'],
      where: { clinicId, quantity: { gt: 0 } },
      _sum: { quantity: true },
    });

    if (rows.length === 0) return [];

    const productIds = rows.map((r) => r.productId);
    const products = await this.db.product.findMany({
      where: { id: { in: productIds }, deletedAt: null },
      select: { id: true, name: true, stockCode: true, criticalStockQty: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return rows.map((row) => {
      const product = productMap.get(row.productId)!;
      const totalQty = row._sum.quantity ?? new Decimal(0);
      return {
        productId: row.productId,
        productName: product.name,
        stockCode: product.stockCode,
        clinicId,
        totalQuantity: totalQty.toString(),
        criticalStockQty: product.criticalStockQty.toString(),
        isBelowCritical: totalQty.lessThan(product.criticalStockQty),
      };
    });
  }

  async getLowStockAlerts(clinicId: string): Promise<StockLevel[]> {
    const all = await this.getStockLevels(clinicId);
    return all.filter((s) => s.isBelowCritical);
  }
}

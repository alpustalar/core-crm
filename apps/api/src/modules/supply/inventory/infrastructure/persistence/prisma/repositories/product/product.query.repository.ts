import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { Pagination, Product as IProduct } from '@shared';

import { Decimal } from 'decimal.js';
import { StockLevel } from '@modules/supply/inventory/domain/contracts/stock-movement.contracts';
import { IProductQueryRepository } from '@modules/supply/inventory/domain/repositories/product/product.query.repository';

@Injectable()
export class ProductQueryRepository
  extends BaseRepository
  implements IProductQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findMany(
    organizationId: string,
    pagination: Pagination
  ): Promise<{ items: IProduct[]; total: number }> {
    return paginate({
      delegate: this.db.product,
      pagination,
      where: { organizationId, deletedAt: null, isActive: true },
    });
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

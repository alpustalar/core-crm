import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { Pagination } from '@shared';
import { ISupplierQueryRepository } from '@modules/supply/inventory/domain/repositories/supplier.repository.interface';
import { Supplier } from '@modules/supply/inventory/domain/entities/supplier.entity';

@Injectable()
export class SupplierQueryRepository
  extends BaseRepository
  implements ISupplierQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Supplier | null> {
    const raw = await this.db.supplier.findUnique({ where: { id } });
    return raw ? new Supplier(raw) : null;
  }

  async findMany(
    organizationId: string,
    pagination: Pagination
  ): Promise<{ items: Supplier[]; total: number }> {
    const result = await paginate({
      delegate: this.db.supplier,
      pagination,
      where: { organizationId },
    });
    return {
      items: result.items.map((r) => new Supplier(r)),
      total: result.total,
    };
  }
}

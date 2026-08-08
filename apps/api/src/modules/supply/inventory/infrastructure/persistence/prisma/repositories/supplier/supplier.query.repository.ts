import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { Pagination, Supplier as ISupplier } from '@shared';
import { ISupplierQueryRepository } from '@modules/supply/inventory/domain/repositories/supplier/supplier.query.repository';
import { Paginated } from '@common/interfaces/paginated.type';

@Injectable()
export class SupplierQueryRepository
  extends BaseRepository
  implements ISupplierQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findMany(
    organizationId: string,
    pagination: Pagination
  ): Promise<Paginated<ISupplier>> {
    return paginate({
      delegate: this.db.supplier,
      pagination,
      where: { organizationId },
    });
  }
}

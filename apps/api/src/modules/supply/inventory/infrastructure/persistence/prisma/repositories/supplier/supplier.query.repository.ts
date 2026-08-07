import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { Pagination } from '@shared';
import { ISupplierQueryRepository } from '@modules/supply/inventory/domain/repositories/supplier.repository.interface';
import { Supplier as ISupplier } from '@shared';

/** Okuma tarafı: entity hidrate edilmez (veri doğrudan HTTP sınırını geçiyor). */
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
  ): Promise<{ items: ISupplier[]; total: number }> {
    return paginate({
      delegate: this.db.supplier,
      pagination,
      where: { organizationId },
    });
  }
}

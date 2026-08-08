import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { Pagination, TreatmentPackage } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { ITreatmentPackageQueryRepository } from '@modules/clinical/treatment-package/domain/repositories/treatment-package/treatment-package.query.repository';
import { TreatmentPackageWithRelations } from '@modules/clinical/treatment-package/domain/contracts/treatment-package.contracts';

const packageInclude = {
  items: { select: { id: true, treatmentId: true, count: true } },
  providers: { select: { id: true, providerId: true } },
};

@Injectable()
export class TreatmentPackageQueryRepository
  extends BaseRepository
  implements ITreatmentPackageQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<TreatmentPackage | null> {
    return this.db.treatmentPackage.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findMany(clinicId: string, pagination: Pagination, isActive?: boolean) {
    const where = {
      clinicId,
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
    };

    const result = await paginate({
      delegate: this.db.treatmentPackage as never,
      pagination,
      where,
      include: packageInclude,
    });

    return result as { items: TreatmentPackageWithRelations[]; total: number };
  }
}

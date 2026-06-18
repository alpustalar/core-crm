import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  ITreatmentPackageQueryRepository,
  TreatmentPackageWithRelations,
} from '../../../../../domain/repositories/treatment-package.repository.interface';
import { Pagination } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { TreatmentPackage } from '@modules/clinical/treatment-package/domain/entities/treatment-package.entity';

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

  async findById(id: string): Promise<TreatmentPackage | null> {
    const raw = await this.db.treatmentPackage.findFirst({
      where: { id, deletedAt: null },
    });

    return raw ? new TreatmentPackage(raw) : null;
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

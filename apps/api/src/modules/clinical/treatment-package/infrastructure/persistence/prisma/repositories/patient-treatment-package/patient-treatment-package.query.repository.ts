import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPatientTreatmentPackageQueryRepository } from '../../../../../domain/repositories/patient-treatment-package.repository.interface';
import { Pagination } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { PatientTreatmentPackage } from '@modules/clinical/treatment-package/domain/entities/patient-treatment-package.entity';

const providerInclude = {
  include: { user: { select: { displayName: true } } },
};

@Injectable()
export class PatientTreatmentPackageQueryRepository
  extends BaseRepository
  implements IPatientTreatmentPackageQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string) {
    const result = await this.db.patientTreatmentPackage.findUnique({
      where: { id },
      include: {
        package: {
          include: {
            items: { select: { id: true, treatmentId: true, count: true } },
          },
        },
        provider: providerInclude,
        payment: { select: { id: true, status: true } },
      },
    });

    return result ? new PatientTreatmentPackage(result) : null;
  }

  async findManyByPatient(
    patientId: string,
    pagination: Pagination,
    status?: string
  ) {
    const result = await paginate({
      delegate: this.db.patientTreatmentPackage,
      pagination,
      where: {
        patientId,
        ...(status && { status }),
      },
      include: {
        package: true,
        provider: providerInclude,
        payment: { select: { id: true, status: true, expectedAmount: true } },
      },
    });

    return this.mapPagination(result, (i) => new PatientTreatmentPackage(i));
  }
}

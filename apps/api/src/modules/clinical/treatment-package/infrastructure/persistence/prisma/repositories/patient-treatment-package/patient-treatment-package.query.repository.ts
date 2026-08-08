import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { Pagination } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IPatientTreatmentPackageQueryRepository } from '@modules/clinical/treatment-package/domain/repositories/patient-treatment-package/patient-treatment-package.query.repository';

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
    return this.db.patientTreatmentPackage.findUnique({
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
  }

  async findManyByPatient(
    patientId: string,
    pagination: Pagination,
    status?: string
  ) {
    return await paginate({
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
  }
}

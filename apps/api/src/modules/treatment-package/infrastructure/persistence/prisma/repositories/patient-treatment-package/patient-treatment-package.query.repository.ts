import { Injectable } from '@nestjs/common';
import { PatientTreatmentPackage } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPatientTreatmentPackageQueryRepository } from '../../../../../domain/repositories/patient-treatment-package.repository.interface';
import { Pagination } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';

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

  findById(id: string) {
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
    }) as Promise<PatientTreatmentPackage | null>;
  }

  async findManyByPatient(
    patientId: string,
    pagination: Pagination,
    status?: string
  ) {
    const where = {
      patientId,
      ...(status && { status }),
    };

    const result = await paginate({
      delegate: this.db.patientTreatmentPackage as never,
      pagination,
      where,
      include: {
        package: true,
        provider: providerInclude,
        payment: { select: { id: true, status: true, expectedAmount: true } },
      },
    });

    return result as { items: PatientTreatmentPackage[]; total: number };
  }
}

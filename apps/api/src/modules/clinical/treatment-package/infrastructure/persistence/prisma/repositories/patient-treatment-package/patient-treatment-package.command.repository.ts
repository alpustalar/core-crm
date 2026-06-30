import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPatientTreatmentPackageCommandRepository } from '../../../../../domain/repositories/patient-treatment-package.repository.interface';
import { PatientTreatmentPackage } from '@modules/clinical/treatment-package/domain/entities/patient-treatment-package.entity';

@Injectable()
export class PatientTreatmentPackageCommandRepository
  extends BaseRepository
  implements IPatientTreatmentPackageCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(
    patientTreatmentPackage: PatientTreatmentPackage
  ): Promise<PatientTreatmentPackage> {
    const raw = patientTreatmentPackage.toPersistence();
    await this.db.patientTreatmentPackage.upsert({
      where: { id: raw.id },
      create: raw,
      update: raw,
    });
    patientTreatmentPackage.flushEvents();

    return new PatientTreatmentPackage(raw);
  }
}

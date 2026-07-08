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
    const persistenceData = patientTreatmentPackage.toPersistence();
    const { id, ...data } = persistenceData;
    await this.db.patientTreatmentPackage.update({
      where: { id },
      data,
    });
    patientTreatmentPackage.flushEvents();

    return new PatientTreatmentPackage(persistenceData);
  }

  async create(
    patientTreatmentPackage: PatientTreatmentPackage
  ): Promise<PatientTreatmentPackage> {
    const data = patientTreatmentPackage.toPersistence();
    const raw = await this.db.patientTreatmentPackage.create({ data });
    patientTreatmentPackage.flushEvents();

    return new PatientTreatmentPackage(raw);
  }

  async findById(id: string) {
    const raw = await this.db.patientTreatmentPackage.findUnique({
      where: { id },
    });
    return raw ? new PatientTreatmentPackage(raw) : null;
  }
}

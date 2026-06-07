import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  CreatePatientPackageInput,
  IPatientTreatmentPackageCommandRepository,
} from '../../../../../domain/repositories/patient-treatment-package.repository.interface';

@Injectable()
export class PatientTreatmentPackageCommandRepository
  extends BaseRepository
  implements IPatientTreatmentPackageCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  create(input: CreatePatientPackageInput) {
    return this.db.patientTreatmentPackage.create({ data: input });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.db.patientTreatmentPackage.update({ where: { id }, data });
  }
}

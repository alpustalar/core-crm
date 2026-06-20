import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { Patient } from '@modules/crm/patient/domain/entities/patient.entity';
import { IPatientCommandRepository } from '@modules/crm/patient/domain/repositories/patient.repository.interface';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class PatientCommandRepository
  extends BaseCommandRepository<Patient>
  implements IPatientCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(patient: Patient): Promise<Patient> {
    const data = patient.toPersistence();

    const raw = await this.db.patient.upsert({
      where: { id: patient.id },
      create: data,
      update: data,
    });

    patient.flushEvents();
    return new Patient(raw);
  }

  async saveMany(patients: Patient[]): Promise<void> {
    const prismaQueries = patients.map((patient) => {
      const data = patient.toPersistence();
      return this.db.patient.upsert({
        where: { id: patient.id },
        create: data,
        update: data,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(prismaQueries);
    } else {
      await this.prisma.$transaction(prismaQueries);
    }

    patients.forEach((patient) => patient.flushEvents());
  }
}

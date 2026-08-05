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

  async findById(id: string): Promise<Patient | null> {
    const raw = await this.db.patient.findUnique({ where: { id } });
    return raw ? new Patient(raw) : null;
  }

  async create(entity: Patient): Promise<Patient> {
    const data = entity.toPersistence();
    const raw = await this.db.patient.create({ data });
    entity.flushEvents();
    return new Patient(raw);
  }

  async sync(entity: Patient) {
    const create = entity.toPersistence();
    const { id, ...update } = create;
    const raw = await this.db.patient.upsert({
      where: { id },
      create,
      update,
    });
    entity.flushEvents();
    return new Patient(raw);
  }

  async update(entity: Patient) {
    const persistenceData = entity.toPersistence();
    const { id, ...data } = persistenceData;
    const raw = await this.db.patient.update({
      where: { id },
      data,
    });
    entity.flushEvents();
    return new Patient(raw);
  }

  async updateMany(patients: Patient[]): Promise<void> {
    const prismaQueries = patients.map((patient) => {
      const create = patient.toPersistence();
      const { id, ...update } = create;
      return this.db.patient.upsert({
        where: { id },
        create,
        update,
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

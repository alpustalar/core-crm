import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPatientRepository } from '@modules/patient/domain/repositories/patient.repository.interface';
import { FindOrCreatePatientForAuth } from '@shared/modules/patients/types/queries';
import { Patient } from '@modules/patient/domain/entities/patient.entity';

@Injectable()
export class PatientRepository
  extends BaseRepository
  implements IPatientRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async find(id: string) {
    const raw = await this.db.patient.findUnique({ where: { id } });
    if (!raw) return null;
    return new Patient(raw);
  }

  async save(entity: Patient): Promise<void> {
    await this.db.patient.update({
      where: { id: entity.id },
      data: entity.toPersistence(),
    });
    entity.flushEvents();
  }

  async findOrCreateByPhone(dto: FindOrCreatePatientForAuth) {
    const { phone, organizationId, firstName, firebaseUid } = dto;
    const raw = await this.db.patient.upsert({
      where: { phone_organizationId: { phone, organizationId } },
      create: { id: firebaseUid, phone, organizationId, firstName },
      update: {},
    });
    return new Patient(raw);
  }
}

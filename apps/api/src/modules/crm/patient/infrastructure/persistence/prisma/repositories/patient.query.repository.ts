import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { FindPatientByContactFilter } from '@modules/crm/patient/domain/repositories/patient.repository.interface';
import { Patient } from '@modules/crm/patient/domain/entities/patient.entity';

@Injectable()
export class PatientQueryRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByContact(
    props: FindPatientByContactFilter
  ): Promise<Patient | null> {
    const { organizationId, phone, email } = props;
    if (!phone && !email) return null;

    const orConditions: Record<string, unknown>[] = [];
    if (phone) orConditions.push({ phone });
    if (email) orConditions.push({ email });

    const raw = await this.db.patient.findFirst({
      where: { organizationId, OR: orConditions },
    });
    return raw ? new Patient(raw) : null;
  }

  async find(id: string) {
    const raw = await this.db.patient.findUnique({ where: { id } });
    if (!raw) return null;
    return new Patient(raw);
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { FindPatientByContactFilter } from '@modules/crm/patient/domain/contracts/patient.contracts';
import { Patient } from '@shared';

@Injectable()
export class PatientQueryRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByContact(
    filter: FindPatientByContactFilter
  ): Promise<Patient | null> {
    const { organizationId, phone, email } = filter;
    if (!phone && !email) return null;

    const orConditions: Record<string, unknown>[] = [];
    if (phone) orConditions.push({ phone });
    if (email) orConditions.push({ email });

    return await this.db.patient.findFirst({
      where: { organizationId, OR: orConditions },
    });
  }

  findById(id: string): Promise<Patient | null> {
    return this.db.patient.findUnique({ where: { id } });
  }
}

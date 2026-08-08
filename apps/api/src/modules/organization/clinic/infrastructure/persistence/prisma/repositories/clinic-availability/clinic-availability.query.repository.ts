import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicAvailabilityQueryRepository } from '@modules/organization/clinic/domain/repositories/clinic-availability/clinic-availability.query.repository';
import { ClinicAvailability } from '@shared';

@Injectable()
export class ClinicAvailabilityQueryRepository
  extends BaseRepository
  implements IClinicAvailabilityQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAllByClinicId(clinicId: string): Promise<ClinicAvailability[]> {
    return this.db.clinicAvailability.findMany({
      where: { clinicId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async findByClinicAndDay(
    clinicId: string,
    dayOfWeek: number
  ): Promise<ClinicAvailability | null> {
    return this.db.clinicAvailability.findUnique({
      where: { clinicId_dayOfWeek: { clinicId, dayOfWeek } },
    });
  }
}

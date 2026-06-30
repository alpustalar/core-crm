import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  IClinicAvailabilityQueryRepository
} from '@modules/organization/clinic/domain/repositories/clinic-availability.repository.interface';
import { ClinicAvailability } from '@modules/organization/clinic/domain/entities/clinic-availability.entity';

@Injectable()
export class ClinicAvailabilityQueryRepository
  extends BaseRepository
  implements IClinicAvailabilityQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByClinicAndDay(
    clinicId: string,
    dayOfWeek: number
  ): Promise<ClinicAvailability | null> {
    const raw = await this.db.clinicAvailability.findUnique({
      where: { clinicId_dayOfWeek: { clinicId, dayOfWeek } },
    });
    return raw ? new ClinicAvailability(raw) : null;
  }

  async findAllByClinicId(clinicId: string): Promise<ClinicAvailability[]> {
    const raw = await this.db.clinicAvailability.findMany({
      where: { clinicId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return raw.map((r) => new ClinicAvailability(r));
  }
}

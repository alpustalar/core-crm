import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  IClinicAvailability,
  IClinicAvailabilityQueryRepository,
  IClinicException,
} from '@modules/organization/clinic/domain/repositories/clinic-availability.repository.interface';

@Injectable()
export class ClinicAvailabilityQueryRepository
  extends BaseRepository
  implements IClinicAvailabilityQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByClinicAndDay(
    clinicId: string,
    dayOfWeek: number
  ): Promise<IClinicAvailability | null> {
    return this.db.clinicAvailability.findUnique({
      where: { clinicId_dayOfWeek: { clinicId, dayOfWeek } },
    });
  }

  findExceptionByClinicAndDate(
    clinicId: string,
    date: Date
  ): Promise<IClinicException | null> {
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    return this.db.clinicException.findUnique({
      where: {
        clinicId_date: {
          clinicId,
          date: normalizedDate,
        },
      },
    });
  }

  findAllByClinicId(clinicId: string): Promise<IClinicAvailability[]> {
    return this.db.clinicAvailability.findMany({
      where: { clinicId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  findExceptionsByDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IClinicException[]> {
    const normalizedStart = new Date(startDate);
    normalizedStart.setUTCHours(0, 0, 0, 0);
    const normalizedEnd = new Date(endDate);
    normalizedEnd.setUTCHours(0, 0, 0, 0);

    return this.db.clinicException.findMany({
      where: {
        clinicId,
        date: { gte: normalizedStart, lte: normalizedEnd },
      },
    });
  }

  async findClosedExceptionByDate(
    clinicId: string,
    date: Date
  ): Promise<Partial<IClinicException> | null> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    return this.db.clinicException.findFirst({
      where: {
        clinicId,
        date: startOfDay,
        isClosed: true,
      },
      select: {
        isClosed: true,
        reason: true,
        date: true,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicExceptionQueryRepository } from '@modules/organization/clinic/domain/repositories/clinic-exception.repository.interface';
import { ClinicException } from '@modules/organization/clinic/domain/entities/clinic-exception.entity';

@Injectable()
export class ClinicExceptionQueryRepository
  extends BaseRepository
  implements IClinicExceptionQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findExceptionByClinicAndDate(
    clinicId: string,
    date: Date
  ): Promise<ClinicException | null> {
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const raw = await this.db.clinicException.findUnique({
      where: {
        clinicId_date: {
          clinicId,
          date: normalizedDate,
        },
      },
    });

    return raw ? new ClinicException(raw) : null;
  }

  async findExceptionsByDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ClinicException[]> {
    const normalizedStart = new Date(startDate);
    normalizedStart.setUTCHours(0, 0, 0, 0);
    const normalizedEnd = new Date(endDate);
    normalizedEnd.setUTCHours(0, 0, 0, 0);

    const rawExceptions = await this.db.clinicException.findMany({
      where: {
        clinicId,
        date: { gte: normalizedStart, lte: normalizedEnd },
      },
    });
    return rawExceptions.map((exception) => new ClinicException(exception));
  }

  async findClosedExceptionByDate(
    clinicId: string,
    date: Date
  ): Promise<Partial<ClinicException> | null> {
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

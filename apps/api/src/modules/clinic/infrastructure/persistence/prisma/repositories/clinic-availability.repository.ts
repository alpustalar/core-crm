import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicAvailabilityRepository } from '@modules/clinic/domain/repositories/clinic-availability.repository.interface';

@Injectable()
export class ClinicAvailabilityRepository
  extends BaseRepository
  implements IClinicAvailabilityRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByClinicAndDay(clinicId: string, dayOfWeek: number) {
    return this.db.clinicAvailability.findUnique({
      where: { clinicId_dayOfWeek: { clinicId, dayOfWeek } },
    });
  }

  findExceptionByClinicAndDate(clinicId: string, date: Date) {
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

  findAllByClinicId(clinicId: string) {
    return this.db.clinicAvailability.findMany({
      where: { clinicId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  findExceptionsByDateRange(clinicId: string, startDate: Date, endDate: Date) {
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

  async findClosedExceptionByDate(clinicId: string, date: Date) {
    // 1. Tarihi normalize et (Saat, dakika, saniyeyi sıfırla)
    // Çünkü DB'de 2026-05-05 00:00:00 olarak kayıtlıdır.
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

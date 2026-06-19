import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IProviderAvailabilityRepository } from '@modules/clinical/provider/domain/repositories/provider-availability.repository.interface';
import {
  CreateProviderAvailabilityData,
  CreateProviderShiftData,
} from '@modules/clinical/provider/domain/provider.contracts';

@Injectable()
export class ProviderAvailabilityRepository
  extends BaseRepository
  implements IProviderAvailabilityRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  create(data: CreateProviderAvailabilityData) {
    return this.db.providerAvailability.create({ data });
  }

  async createMany(data: CreateProviderAvailabilityData[]): Promise<void> {
    await this.db.providerAvailability.createMany({ data });
  }

  findByProviderId(providerId: string) {
    return this.db.providerAvailability.findMany({
      where: { providerId },
      orderBy: { dayOfWeek: 'asc' },
      include: {
        provider: {
          select: {
            canAcceptExamination: true,
            operationMode: true,
          },
        },
      },
    });
  }

  findByProviderAndDay(providerId: string, dayOfWeek: number) {
    return this.db.providerAvailability.findUnique({
      where: { providerId_dayOfWeek: { providerId, dayOfWeek } },
    });
  }

  async deleteByProviderId(providerId: string) {
    const result = await this.db.providerAvailability.deleteMany({
      where: { providerId },
    });
    return { deletedCount: result.count };
  }

  findExceptionsByDateRange(
    providerId: string,
    startDate: Date,
    endDate: Date
  ) {
    return this.db.providerException.findMany({
      where: {
        providerId,
        startTime: { lt: endDate },
        endTime: { gt: startDate },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  findShiftsByDateRange(providerId: string, startDate: Date, endDate: Date) {
    return this.db.providerShift.findMany({
      where: {
        providerId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });
  }

  async upsertManyShifts(data: CreateProviderShiftData[]): Promise<void> {
    if (!data.length) return;
    const { providerId } = data[0];
    const dates = data.map((d) => d.date);

    await this.db.providerShift.deleteMany({
      where: { providerId, date: { in: dates } },
    });
    await this.db.providerShift.createMany({ data });
  }
}

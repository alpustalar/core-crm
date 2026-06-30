import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ProviderShift } from '@modules/clinical/provider/domain/entities/provider-shift.entity';
import { IProviderShiftQueryRepository } from '@modules/clinical/provider/domain/repositories/provider-shift.repository.interface';

@Injectable()
export class ProviderShiftQueryRepository
  extends BaseRepository
  implements IProviderShiftQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findShiftsByDateRange(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProviderShift[]> {
    const raws = await this.db.providerShift.findMany({
      where: {
        providerId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    return raws.map((shift) => new ProviderShift(shift));
  }
}

import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IProviderExceptionQueryRepository } from '@modules/clinical/provider/domain/repositories/provider-exception/provider-exception.query.repository';
import { ProviderException } from '@shared';

@Injectable()
export class ProviderExceptionQueryRepository
  extends BaseRepository
  implements IProviderExceptionQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findExceptionsByDateRange(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProviderException[]> {
    return this.db.providerException.findMany({
      where: {
        providerId,
        startTime: { lt: endDate },
        endTime: { gt: startDate },
      },
      orderBy: { startTime: 'asc' },
    });
  }
}

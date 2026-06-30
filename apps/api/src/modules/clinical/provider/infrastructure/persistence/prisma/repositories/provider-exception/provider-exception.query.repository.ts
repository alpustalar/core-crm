import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ProviderException } from '@modules/clinical/provider/domain/entities/provider-exception.entity';
import { IProviderExceptionQueryRepository } from '@modules/clinical/provider/domain/repositories/provider-exception.repository.interface';

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
    const raws = await this.db.providerException.findMany({
      where: {
        providerId,
        startTime: { lt: endDate },
        endTime: { gt: startDate },
      },
      orderBy: { startTime: 'asc' },
    });
    return raws.map((raw) => new ProviderException(raw));
  }
}

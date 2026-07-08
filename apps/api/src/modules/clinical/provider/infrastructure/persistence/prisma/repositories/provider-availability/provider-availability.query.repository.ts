import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ProviderAvailability } from '@modules/clinical/provider/domain/entities/provider-availability.entity';
import { IProviderAvailabilityQueryRepository } from '@modules/clinical/provider/domain/repositories/provider-availability.repository.interface';

@Injectable()
export class ProviderAvailabilityQueryRepository
  extends BaseRepository
  implements IProviderAvailabilityQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findManyByProviderId(providerId: string) {
    return this.db.providerAvailability.findMany({
      where: { providerId },
      orderBy: { dayOfWeek: 'asc' },
      include: {
        provider: {
          select: {
            acceptsConsultation: true,
            operationMode: true,
          },
        },
      },
    });
  }

  async findByProviderAndDay(
    providerId: string,
    dayOfWeek: number
  ): Promise<ProviderAvailability | null> {
    const raw = await this.db.providerAvailability.findUnique({
      where: { providerId_dayOfWeek: { providerId, dayOfWeek } },
    });
    return raw ? new ProviderAvailability(raw) : null;
  }
}

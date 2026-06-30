import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';

import { CreateProviderAvailabilityData } from '@modules/clinical/provider/domain/contracts/provider.contracts';
import { ProviderAvailability } from '@modules/clinical/provider/domain/entities/provider-availability.entity';
import { IProviderAvailabilityCommandRepository } from '@modules/clinical/provider/domain/repositories/provider-availability.repository.interface';

@Injectable()
export class ProviderAvailabilityCommandRepository
  extends BaseRepository
  implements IProviderAvailabilityCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<ProviderAvailability | null> {
    const raw = await this.db.providerAvailability.findUnique({
      where: { id },
    });
    return raw ? new ProviderAvailability(raw) : null;
  }

  async save(entity: ProviderAvailability) {
    const create = entity.toPersistence();
    const { id, ...update } = create;
    const raw = await this.db.providerAvailability.upsert({
      where: { id },
      create,
      update,
    });
    entity.flushEvents();
    return new ProviderAvailability(raw);
  }

  async createMany(data: CreateProviderAvailabilityData[]): Promise<void> {
    await this.db.providerAvailability.createMany({ data });
  }

  async deleteByProviderId(providerId: string) {
    const result = await this.db.providerAvailability.deleteMany({
      where: { providerId },
    });
    return { deletedCount: result.count };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ProviderAvailability } from '@modules/clinical/provider/domain/entities/provider-availability.entity';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { IProviderAvailabilityCommandRepository } from '@modules/clinical/provider/domain/repositories/provider-availability/provider-availability.command.repository';

@Injectable()
export class ProviderAvailabilityCommandRepository
  extends BaseCommandRepository<ProviderAvailability>
  implements IProviderAvailabilityCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: ProviderAvailability): Promise<ProviderAvailability> {
    const data = entity.toPersistence();
    const raw = await this.db.providerAvailability.create({ data });
    entity.flushEvents();
    return new ProviderAvailability(raw);
  }

  async findById(id: string): Promise<ProviderAvailability | null> {
    const raw = await this.db.providerAvailability.findUnique({
      where: { id },
    });
    return raw ? new ProviderAvailability(raw) : null;
  }

  async update(entity: ProviderAvailability) {
    const toPersistence = entity.toPersistence();
    const { id, ...data } = toPersistence;
    const raw = await this.db.providerAvailability.update({
      where: { id },
      data,
    });
    entity.flushEvents();
    return new ProviderAvailability(raw);
  }

  async updateMany(availabilities: ProviderAvailability[]): Promise<void> {
    const queries = availabilities.map((availability) => {
      const data = availability.toPersistence();
      const { id, ...updateData } = data;

      // Tekil update yerine query sözünü (Promise) dönüyoruz, henüz DB'ye tetiklemiyoruz!
      return this.db.providerAvailability.update({
        where: { id },
        data: updateData,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(queries);
    } else {
      await this.prisma.$transaction(queries);
    }

    availabilities.forEach((a) => a.flushEvents());
  }

  async createMany(data: ProviderAvailability[]): Promise<void> {
    const persistenceData = data.map((d) => d.toPersistence());
    await this.db.providerAvailability.createMany({
      data: persistenceData,
    });
    for (const availability of data) {
      availability.flushEvents();
    }
  }

  async deleteManyByProviderId(providerId: string) {
    const result = await this.db.providerAvailability.deleteMany({
      where: { providerId },
    });
    return { deletedCount: result.count };
  }
}

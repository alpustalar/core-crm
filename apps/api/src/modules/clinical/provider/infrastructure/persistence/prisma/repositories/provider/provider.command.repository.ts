import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IProviderCommandRepository } from '@modules/clinical/provider/domain/repositories/provider.repository.interface';
import { Provider } from '@modules/clinical/provider/domain/entities/provider.entity';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class ProviderCommandRepository
  extends BaseCommandRepository<Provider>
  implements IProviderCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(entity: Provider): Promise<Provider> {
    const data = entity.toPersistence();

    const raw = await this.db.provider.upsert({
      where: { id: entity.id },
      create: data,
      update: data,
    });

    entity.flushEvents();
    return new Provider(raw);
  }

  async saveMany(providers: Provider[]): Promise<void> {
    const prismaQueries = providers.map((provider) => {
      const data = provider.toPersistence();
      return this.db.provider.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(prismaQueries);
    } else {
      await this.prisma.$transaction(prismaQueries);
    }

    providers.forEach((provider) => provider.flushEvents());
  }

}

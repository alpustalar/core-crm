import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';

import { Provider } from '@modules/clinical/provider/domain/entities/provider.entity';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';
import { IProviderCommandRepository } from '@modules/clinical/provider/domain/repositories/provider/provider.command.repository';

@Injectable()
export class ProviderCommandRepository
  extends BaseCommandRepository<Provider>
  implements IProviderCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Provider | null> {
    const raw = await this.db.provider.findUnique({ where: { id } });
    return raw ? new Provider(raw) : null;
  }

  async create(entity: Provider): Promise<Provider> {
    const data = entity.toPersistence();
    const raw = await this.db.provider.create({ data });
    entity.flushEvents();
    return new Provider(raw);
  }

  async update(entity: Provider) {
    const data = entity.toPersistence();
    const { id, ...update } = data;
    const raw = await this.db.provider.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new Provider(raw);
  }

  async sync(entity: Provider) {
    const create = entity.toPersistence();
    const { id, ...update } = create;
    const raw = await this.db.provider.upsert({
      where: { id },
      create,
      update,
    });
    entity.flushEvents();
    return new Provider(raw);
  }

  async updateMany(providers: Provider[]): Promise<void> {
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

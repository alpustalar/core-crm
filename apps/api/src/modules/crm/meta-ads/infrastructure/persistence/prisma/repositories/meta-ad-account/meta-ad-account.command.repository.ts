import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IMetaAdAccountCommandRepository } from '@modules/crm/meta-ads/domain/repositories/meta-ad-account.repository.interface';
import { MetaAdAccount } from '@modules/crm/meta-ads/domain/entities/meta-ad-account.entity';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class MetaAdAccountCommandRepository
  extends BaseCommandRepository<MetaAdAccount>
  implements IMetaAdAccountCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: MetaAdAccount): Promise<MetaAdAccount> {
    const toPersistence = data.toPersistence();
    const raw = await this.db.metaAdAccount.create({
      data: toPersistence,
    });
    return new MetaAdAccount(raw);
  }

  async findById(id: string): Promise<MetaAdAccount | null> {
    const raw = await this.db.metaAdAccount.findUnique({ where: { id } });
    return raw ? new MetaAdAccount(raw) : null;
  }

  async save(entity: MetaAdAccount) {
    const data = entity.toPersistence();
    const { id, ...update } = data;
    const raw = await this.db.metaAdAccount.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new MetaAdAccount(raw);
  }

  async saveMany(entities: MetaAdAccount[]): Promise<void> {
    const prismaQueries = entities.map((entity) => {
      const create = entity.toPersistence();
      const { id, ...update } = create;
      return this.db.metaAdAccount.upsert({
        where: { id: id },
        create,
        update,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(prismaQueries);
    } else {
      await this.prisma.$transaction(prismaQueries);
    }

    entities.forEach((entity) => entity.flushEvents());
  }

  async deactivate(id: string): Promise<void> {
    await this.db.metaAdAccount.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

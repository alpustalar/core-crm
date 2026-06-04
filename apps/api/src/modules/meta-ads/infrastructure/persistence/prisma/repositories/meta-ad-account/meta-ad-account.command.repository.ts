import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IMetaAdAccountCommandRepository } from '@modules/meta-ads/domain/repositories/meta-ad-account.repository.interface';
import { MetaAdAccount } from '@modules/meta-ads/domain/entities/meta-ad-account.entity';
import { CreateMetaAdAccountProps } from '@modules/meta-ads/domain/types/create-meta-ad-account.props';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class MetaAdAccountCommandRepository
  extends BaseCommandRepository<MetaAdAccount>
  implements IMetaAdAccountCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(props: CreateMetaAdAccountProps): Promise<MetaAdAccount> {
    const raw = await this.db.metaAdAccount.create({
      data: {
        id: props.id,
        clinicId: props.clinicId,
        adAccountId: props.adAccountId,
        accessToken: props.accessToken,
        tokenExpiresAt: props.tokenExpiresAt ?? null,
        pageId: props.pageId ?? null,
        businessName: props.businessName ?? null,
      },
    });
    return new MetaAdAccount(raw);
  }

  async save(entity: MetaAdAccount): Promise<MetaAdAccount> {
    const data = entity.toPersistence();

    const raw = await this.db.metaAdAccount.upsert({
      where: { id: entity.id },
      create: data,
      update: data,
    });

    entity.flushEvents();
    return new MetaAdAccount(raw);
  }

  async saveMany(entities: MetaAdAccount[]): Promise<void> {
    const prismaQueries = entities.map((entity) => {
      const data = entity.toPersistence();
      return this.db.metaAdAccount.upsert({
        where: { id: entity.id },
        create: data,
        update: data,
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

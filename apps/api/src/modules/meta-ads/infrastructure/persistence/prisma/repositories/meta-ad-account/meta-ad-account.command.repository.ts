import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IMetaAdAccountCommandRepository } from '@modules/meta-ads/domain/repositories/meta-ad-account.repository.interface';
import { MetaAdAccount } from '@modules/meta-ads/domain/entities/meta-ad-account.entity';
import { CreateMetaAdAccountProps } from '@modules/meta-ads/domain/types/create-meta-ad-account.props';

@Injectable()
export class MetaAdAccountCommandRepository
  extends BaseRepository
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
    const raw = await this.db.metaAdAccount.update({
      where: { id: entity.id },
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new MetaAdAccount(raw);
  }

  async deactivate(id: string): Promise<void> {
    await this.db.metaAdAccount.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

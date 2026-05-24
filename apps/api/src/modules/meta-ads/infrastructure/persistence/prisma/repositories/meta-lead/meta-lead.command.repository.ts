import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IMetaLeadCommandRepository } from '@modules/meta-ads/domain/repositories/meta-lead.repository.interface';
import { MetaLead } from '@modules/meta-ads/domain/entities/meta-lead.entity';
import { CreateMetaLeadProps } from '@modules/meta-ads/domain/types/create-meta-lead.props';

@Injectable()
export class MetaLeadCommandRepository
  extends BaseRepository
  implements IMetaLeadCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(props: CreateMetaLeadProps): Promise<MetaLead> {
    const raw = await this.db.metaLead.create({
      data: {
        id: props.id,
        metaAdAccountId: props.metaAdAccountId,
        metaLeadId: props.metaLeadId,
        formId: props.formId ?? null,
        campaignId: props.campaignId ?? null,
        campaignName: props.campaignName ?? null,
        adsetId: props.adsetId ?? null,
        adId: props.adId ?? null,
        name: props.name ?? null,
        phone: props.phone ?? null,
        email: props.email ?? null,
        rawData:
          props.rawData != null
            ? (props.rawData as Prisma.InputJsonValue)
            : Prisma.JsonNull,
      },
    });
    return new MetaLead(raw);
  }

  async save(entity: MetaLead): Promise<MetaLead> {
    const persistence = entity.toPersistence();
    const raw = await this.db.metaLead.update({
      where: { id: entity.id },
      data: {
        ...persistence,
        rawData:
          persistence.rawData !== null && persistence.rawData !== undefined
            ? (persistence.rawData as Prisma.InputJsonValue)
            : Prisma.JsonNull,
      },
    });
    entity.flushEvents();
    return new MetaLead(raw);
  }
}

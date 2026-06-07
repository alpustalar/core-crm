import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IMetaLeadCommandRepository } from '@modules/crm/meta-ads/domain/repositories/meta-lead.repository.interface';
import { MetaLead } from '@modules/crm/meta-ads/domain/entities/meta-lead.entity';
import { CreateMetaLeadProps } from '@modules/crm/meta-ads/domain/types/create-meta-lead.props';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class MetaLeadCommandRepository
  extends BaseCommandRepository<MetaLead>
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

    const rawDataValue = persistence.rawData ?? Prisma.JsonNull;

    const raw = await this.db.metaLead.upsert({
      where: { id: entity.id },
      create: { ...persistence, rawData: rawDataValue },
      update: { ...persistence, rawData: rawDataValue },
    });

    entity.flushEvents();
    return new MetaLead(raw);
  }

  async saveMany(metaLeads: MetaLead[]): Promise<void> {
    const prismaQueries = metaLeads.map((metaLead) => {
      const persistence = metaLead.toPersistence();
      const rawDataValue = persistence.rawData ?? Prisma.JsonNull;

      return this.db.metaLead.upsert({
        where: { id: metaLead.id },
        create: { ...persistence, rawData: rawDataValue },
        update: { ...persistence, rawData: rawDataValue },
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(prismaQueries);
    } else {
      await this.prisma.$transaction(prismaQueries);
    }

    metaLeads.forEach((metaLead) => metaLead.flushEvents());
  }
}

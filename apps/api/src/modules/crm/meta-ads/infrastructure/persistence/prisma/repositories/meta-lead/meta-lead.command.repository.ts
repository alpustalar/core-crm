import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IMetaLeadCommandRepository } from '@modules/crm/meta-ads/domain/repositories/meta-lead.repository.interface';
import { MetaLead } from '@modules/crm/meta-ads/domain/entities/meta-lead.entity';

import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';
import { CreateMetaLeadData } from '@modules/crm/meta-ads/domain/meta-ads.contracts';

@Injectable()
export class MetaLeadCommandRepository
  extends BaseCommandRepository<MetaLead>
  implements IMetaLeadCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(props: CreateMetaLeadData): Promise<MetaLead> {
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

  async findById(id: string): Promise<MetaLead | null> {
    const raw = await this.db.metaLead.findUnique({ where: { id } });
    return raw ? new MetaLead(raw) : null;
  }

  async save(entity: MetaLead) {
    const data = entity.toPersistence();

    const create = {
      id: data.id,
      metaAdAccountId: data.metaAdAccountId,
      metaLeadId: data.metaLeadId,
      formId: data.formId ?? null,
      campaignId: data.campaignId ?? null,
      campaignName: data.campaignName ?? null,
      adsetId: data.adsetId ?? null,
      adId: data.adId ?? null,
      name: data.name ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      rawData:
        data.rawData != null
          ? (data.rawData as Prisma.InputJsonValue)
          : Prisma.JsonNull,
    };

    const { id, ...update } = create;

    const raw = await this.db.metaLead.upsert({
      where: { id },
      create,
      update,
    });
    entity.flushEvents();
    return new MetaLead(raw);
  }

  async saveMany(metaLeads: MetaLead[]): Promise<void> {
    const prismaQueries = metaLeads.map((metaLead) => {
      const create = metaLead.toPersistence();
      const { id, ...update } = create;
      const rawDataValue = create.rawData ?? Prisma.JsonNull;

      return this.db.metaLead.upsert({
        where: { id },
        create: { ...create, rawData: rawDataValue },
        update: { ...update, rawData: rawDataValue },
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

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IMetaLeadCommandRepository } from '@modules/crm/meta-ads/domain/repositories/meta-lead.repository.interface';
import { MetaLead } from '@modules/crm/meta-ads/domain/entities/meta-lead.entity';

import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class MetaLeadCommandRepository
  extends BaseCommandRepository<MetaLead>
  implements IMetaLeadCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<MetaLead | null> {
    const raw = await this.db.metaLead.findUnique({ where: { id } });
    return raw ? new MetaLead(raw) : null;
  }

  async create(metaLead: MetaLead): Promise<MetaLead> {
    const persistenceData = metaLead.toPersistence();
    const raw = await this.db.metaLead.create({
      data: {
        ...persistenceData,
        rawData: persistenceData.rawData ?? Prisma.DbNull,
      },
    });
    metaLead.flushEvents();
    return new MetaLead(raw);
  }

  async createMany(metaLeads: MetaLead[]): Promise<void> {
    const persistenceData = metaLeads.map((metaLead) =>
      metaLead.toPersistence()
    );

    const data = persistenceData.map((data) => ({
      ...data,
      rawData: data.rawData ?? Prisma.DbNull,
    }));

    await this.db.metaLead.createMany({ data });

    metaLeads.forEach((metaLead) => metaLead.flushEvents());
  }

  async update(metaLead: MetaLead) {
    const persistenceData = metaLead.toPersistence();

    const create = {
      ...persistenceData,
      rawData: persistenceData.rawData ?? Prisma.DbNull,
    };

    const { id, ...data } = create;

    const raw = await this.db.metaLead.update({
      where: { id },
      data,
    });
    metaLead.flushEvents();
    return new MetaLead(raw);
  }

  async sync(metaLead: MetaLead) {
    const persistenceData = metaLead.toPersistence();

    const create = {
      ...persistenceData,
      rawData: persistenceData.rawData ?? Prisma.DbNull,
    };

    const { id, ...update } = create;

    const raw = await this.db.metaLead.upsert({
      where: { id },
      create,
      update,
    });
    metaLead.flushEvents();
    return new MetaLead(raw);
  }

  async updateMany(metaLeads: MetaLead[]): Promise<void> {
    const queries = metaLeads.map((metaLead) => {
      const persistenceData = metaLead.toPersistence();

      const create = {
        ...persistenceData,
        rawData: persistenceData.rawData ?? Prisma.DbNull,
      };

      const { id, ...data } = create;

      return this.db.metaLead.update({
        where: { id },
        data,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(queries);
    } else {
      await this.prisma.$transaction(queries);
    }

    metaLeads.forEach((metaLead) => metaLead.flushEvents());
  }

  async syncMany(metaLeads: MetaLead[]): Promise<void> {
    const queries = metaLeads.map((metaLead) => {
      const persistenceData = metaLead.toPersistence();

      const create = {
        ...persistenceData,
        rawData: persistenceData.rawData ?? Prisma.DbNull,
      };

      const { id, ...update } = create;

      return this.db.metaLead.upsert({
        where: { id },
        create,
        update,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(queries);
    } else {
      await this.prisma.$transaction(queries);
    }

    metaLeads.forEach((metaLead) => metaLead.flushEvents());
  }
}

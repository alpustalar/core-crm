import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { Lead } from '@modules/crm/lead/domain/entities/lead.entity';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';
import { ILeadCommandRepository } from '@modules/crm/lead/domain/repositories/lead/lead.command.repository';

@Injectable()
export class LeadCommandRepository
  extends BaseCommandRepository<Lead>
  implements ILeadCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: Lead): Promise<Lead> {
    const raw = await this.db.lead.create({ data: entity.toPersistence() });
    entity.flushEvents();
    return new Lead(raw);
  }

  async findById(id: string): Promise<Lead | null> {
    const raw = await this.db.lead.findUnique({ where: { id } });
    return raw ? new Lead(raw) : null;
  }

  async update(entity: Lead): Promise<Lead> {
    const data = entity.toPersistence();
    const { id, ...update } = data;
    const raw = await this.db.lead.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new Lead(raw);
  }

  async updateMany(leads: Lead[]): Promise<void> {
    const prismaQueries = leads.map((lead) => {
      const data = lead.toPersistence();
      return this.db.lead.upsert({
        where: { id: lead.id.value },
        create: data,
        update: data,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(prismaQueries);
    } else {
      await this.prisma.$transaction(prismaQueries);
    }

    leads.forEach((lead) => lead.flushEvents());
  }
}

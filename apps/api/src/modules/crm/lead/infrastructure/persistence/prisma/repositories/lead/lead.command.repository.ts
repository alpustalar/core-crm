import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ILeadCommandRepository } from '@modules/crm/lead/domain/repositories/lead.repository.interface';
import { Lead } from '@modules/crm/lead/domain/entities/lead.entity';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';
import { CreateLeadProps } from '@modules/crm/lead/domain/lead-contracts';

@Injectable()
export class LeadCommandRepository
  extends BaseCommandRepository<Lead>
  implements ILeadCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(props: CreateLeadProps): Promise<Lead> {
    const raw = await this.db.lead.create({
      data: {
        id: props.id,
        clinicId: props.clinicId,
        source: props.source,
        name: props.name ?? null,
        phone: props.phone ?? null,
        email: props.email ?? null,
        notes: props.notes ?? null,
        assignedToId: props.assignedToId ?? null,
        whatsAppConversationId: props.whatsAppConversationId ?? null,
      },
    });
    return new Lead(raw);
  }

  async findById(id: string): Promise<Lead | null> {
    const raw = await this.db.lead.findUnique({ where: { id } });
    return raw ? new Lead(raw) : null;
  }

  async save(entity: Lead) {
    const create = entity.toPersistence();
    const { id, ...update } = create;
    const raw = await this.db.lead.upsert({
      where: { id },
      create,
      update,
    });
    entity.flushEvents();
    return new Lead(raw);
  }

  async saveMany(leads: Lead[]): Promise<void> {
    const prismaQueries = leads.map((lead) => {
      const data = lead.toPersistence();
      return this.db.lead.upsert({
        where: { id: lead.id },
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

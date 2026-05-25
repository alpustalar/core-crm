import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ILeadCommandRepository } from '@modules/lead/domain/repositories/lead.repository.interface';
import { Lead } from '@modules/lead/domain/entities/lead.entity';
import { CreateLeadProps } from '@modules/lead/domain/types/create-lead.props';

@Injectable()
export class LeadCommandRepository
  extends BaseRepository
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

  async save(entity: Lead): Promise<Lead> {
    const raw = await this.db.lead.update({
      where: { id: entity.id },
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new Lead(raw);
  }
}

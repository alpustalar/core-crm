import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IConversationCommandRepository } from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { Conversation } from '@modules/messaging/conversation/domain/entities/conversation.entity';
import { FindConversationByContactProps } from '@modules/messaging/conversation/domain/contracts/conversation.contracts';

@Injectable()
export class ConversationCommandRepository
  extends BaseCommandRepository<Conversation>
  implements IConversationCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Conversation | null> {
    const raw = await this.db.conversation.findUnique({ where: { id } });
    return raw ? new Conversation(raw) : null;
  }

  async findByIdForUpdate(id: string): Promise<Conversation | null> {
    await this.lockRowForUpdate('conversations', id);
    return this.findById(id);
  }

  async findByContactForUpdate(
    props: FindConversationByContactProps
  ): Promise<Conversation | null> {
    const existing = await this.db.conversation.findUnique({
      where: {
        clinicId_channel_contactPhone: {
          clinicId: props.clinicId,
          channel: props.channel,
          contactPhone: props.contactPhone,
        },
      },
      select: { id: true },
    });
    // Yazışma yoksa kilitlenecek satır da yok; mükerrerliği @@unique kısıtı engeller.
    if (!existing) return null;

    return this.findByIdForUpdate(existing.id);
  }

  async create(entity: Conversation): Promise<Conversation> {
    const data = entity.toPersistence();
    const raw = await this.db.conversation.create({ data });
    entity.flushEvents();
    return new Conversation(raw);
  }

  async update(entity: Conversation): Promise<Conversation> {
    const data = entity.toPersistence();
    const raw = await this.db.conversation.update({
      where: { id: data.id },
      data: {
        contactName: data.contactName,
        patientId: data.patientId,
        leadId: data.leadId,
        status: data.status,
        assignedUserId: data.assignedUserId,
        lastMessageAt: data.lastMessageAt,
        lastInboundAt: data.lastInboundAt,
        unreadCount: data.unreadCount,
        agentReadAt: data.agentReadAt,
        windowExpiresAt: data.windowExpiresAt,
        marketingOptOut: data.marketingOptOut,
        optOutAt: data.optOutAt,
      },
    });
    entity.flushEvents();
    return new Conversation(raw);
  }
}

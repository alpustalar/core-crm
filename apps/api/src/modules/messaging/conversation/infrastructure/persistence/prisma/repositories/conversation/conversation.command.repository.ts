import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IConversationCommandRepository } from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { Conversation } from '@modules/messaging/conversation/domain/entities/conversation.entity';

@Injectable()
export class ConversationCommandRepository
  extends BaseRepository
  implements IConversationCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(entity: Conversation): Promise<Conversation> {
    const data = entity.toPersistence();
    const raw = await this.db.conversation.upsert({
      where: { id: data.id },
      create: data,
      update: {
        contactName: data.contactName,
        patientId: data.patientId,
        leadId: data.leadId,
        status: data.status,
        assignedUserId: data.assignedUserId,
        lastMessageAt: data.lastMessageAt,
      },
    });
    entity.flushEvents();
    return new Conversation(raw);
  }
}

import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IConversationQueryRepository } from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { Conversation } from '@modules/messaging/conversation/domain/entities/conversation.entity';
import {
  FindConversationByContactProps,
  FindConversationsFilter,
} from '@modules/messaging/conversation/domain/contracts/conversation.contracts';

@Injectable()
export class ConversationQueryRepository
  extends BaseRepository
  implements IConversationQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Conversation | null> {
    const raw = await this.db.conversation.findUnique({ where: { id } });
    return raw ? new Conversation(raw) : null;
  }

  async findByContact(
    props: FindConversationByContactProps
  ): Promise<Conversation | null> {
    const raw = await this.db.conversation.findUnique({
      where: {
        clinicId_channel_contactPhone: {
          clinicId: props.clinicId,
          channel: props.channel,
          contactPhone: props.contactPhone,
        },
      },
    });
    return raw ? new Conversation(raw) : null;
  }

  async findMany(
    filter: FindConversationsFilter
  ): Promise<{ items: Conversation[]; total: number }> {
    const where: Record<string, unknown> = { clinicId: filter.clinicId };
    if (filter.status) where.status = filter.status;
    if (filter.assignedUserId) where.assignedUserId = filter.assignedUserId;

    const result = await paginate({
      delegate: this.db.conversation,
      pagination: filter.pagination,
      where,
    });

    return this.mapPagination(result, (r) => new Conversation(r));
  }
}

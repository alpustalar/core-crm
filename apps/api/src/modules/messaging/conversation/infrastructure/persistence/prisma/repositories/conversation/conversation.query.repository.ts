import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IConversationQueryRepository } from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { Conversation as IConversation } from '@shared';
import {
  FindConversationByContactProps,
  FindConversationsFilter,
} from '@modules/messaging/conversation/domain/contracts/conversation.contracts';

/** Okuma tarafı: entity hidrate edilmez; karar besleyen okumalar Command Repo'da. */
@Injectable()
export class ConversationQueryRepository
  extends BaseRepository
  implements IConversationQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<IConversation | null> {
    return this.db.conversation.findUnique({ where: { id } });
  }

  findByContact(
    props: FindConversationByContactProps
  ): Promise<IConversation | null> {
    return this.db.conversation.findUnique({
      where: {
        clinicId_channel_contactPhone: {
          clinicId: props.clinicId,
          channel: props.channel,
          contactPhone: props.contactPhone,
        },
      },
    });
  }

  findMany(
    filter: FindConversationsFilter
  ): Promise<{ items: IConversation[]; total: number }> {
    const where: Record<string, unknown> = { clinicId: filter.clinicId };
    if (filter.status) where.status = filter.status;
    if (filter.assignedUserId) where.assignedUserId = filter.assignedUserId;

    return paginate({
      delegate: this.db.conversation,
      pagination: filter.pagination,
      where,
    });
  }
}

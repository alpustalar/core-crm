import { Injectable } from '@nestjs/common';
import { Pagination } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IMessageQueryRepository } from '@modules/messaging/conversation/domain/repositories/message.repository';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';

@Injectable()
export class MessageQueryRepository
  extends BaseRepository
  implements IMessageQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByExternalId(externalId: string): Promise<Message | null> {
    const raw = await this.db.message.findFirst({ where: { externalId } });
    return raw ? new Message(raw) : null;
  }

  async findManyByConversation(
    conversationId: string,
    pagination: Pagination
  ): Promise<{ items: Message[]; total: number }> {
    const result = await paginate({
      delegate: this.db.message,
      pagination,
      where: { conversationId },
    });

    return this.mapPagination(result, (r) => new Message(r));
  }
}

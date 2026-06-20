import { Injectable } from '@nestjs/common';
import { Pagination } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { MessageDirection } from '@prisma/client';
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

  async findById(id: string): Promise<Message | null> {
    const raw = await this.db.message.findUnique({ where: { id } });
    return raw ? new Message(raw) : null;
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

  async findLatestInboundExternalId(
    conversationId: string
  ): Promise<string | null> {
    const raw = await this.db.message.findFirst({
      where: {
        conversationId,
        direction: MessageDirection.INBOUND,
        externalId: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      select: { externalId: true },
    });
    return raw?.externalId ?? null;
  }

  async aggregateUsageByCategory(params: {
    clinicId: string;
    from: Date;
    to: Date;
  }): Promise<Array<{ category: string | null; count: number }>> {
    const rows = await this.db.message.groupBy({
      by: ['pricingCategory'],
      where: {
        billable: true,
        createdAt: { gte: params.from, lte: params.to },
        conversation: { clinicId: params.clinicId },
      },
      _count: { _all: true },
    });
    return rows.map((r) => ({
      category: r.pricingCategory,
      count: r._count._all,
    }));
  }
}
